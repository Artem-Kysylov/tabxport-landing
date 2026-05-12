'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { userHasGoogleIdentity } from '@/lib/google-user-profile';
import { GoogleAuthStatus, type GoogleDriveAccessResult } from '@/types/google';

interface SignInOptions {
  action?: 'upgrade';
  nextPath?: string;
}

export function useGoogleAuth() {
  const [authStatus, setAuthStatus] = useState<GoogleAuthStatus>({
    isAuthenticated: false,
    hasRequiredScopes: false,
    user: null,
    loading: true,
  });

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          setAuthStatus({
            isAuthenticated: false,
            hasRequiredScopes: false,
            user: null,
            loading: false,
          });
          return;
        }

        let { data: { session } } = await supabase.auth.getSession();
        const authUser = session?.user ?? user;
        const hasGoogle = userHasGoogleIdentity(authUser);
        let hasProviderToken = !!session?.provider_token;

        if (hasGoogle && !hasProviderToken) {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError && refreshData.session) {
            session = refreshData.session;
            hasProviderToken = !!refreshData.session.provider_token;
          }
        }

        setAuthStatus({
          isAuthenticated: true,
          hasRequiredScopes: hasGoogle && hasProviderToken,
          user: authUser,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthStatus({
          isAuthenticated: false,
          hasRequiredScopes: false,
          user: null,
          loading: false,
        });
      }
    };

    checkAuthStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          setAuthStatus({
            isAuthenticated: false,
            hasRequiredScopes: false,
            user: null,
            loading: false,
          });
          return;
        }

        if (!session?.user) {
          return;
        }

        if (
          event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          const hasGoogle = userHasGoogleIdentity(session.user);
          const hasProviderToken = !!session.provider_token;
          setAuthStatus({
            isAuthenticated: true,
            hasRequiredScopes: hasGoogle && hasProviderToken,
            user: session.user,
            loading: false,
          });
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(async (options?: SignInOptions) => {
    try {
      setAuthStatus(prev => ({ ...prev, loading: true }));

      if (typeof window === 'undefined') {
        throw new Error('Google sign-in must run in the browser');
      }

      const baseUrl = window.location.origin;

      const nextUrl = new URL(options?.nextPath ?? `${window.location.pathname}${window.location.search}`, baseUrl);

      if (options?.action === 'upgrade') {
        nextUrl.searchParams.set('action', 'upgrade');
      }

      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
      const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes:
            'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        setAuthStatus(prev => ({ ...prev, loading: false }));
        throw error;
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthStatus(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    try {
      setAuthStatus(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setAuthStatus({
        isAuthenticated: false,
        hasRequiredScopes: false,
        user: null,
        loading: false,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthStatus(prev => ({ ...prev, loading: false }));
      throw error;
    }
  }, [supabase]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.provider_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }, [supabase]);

  /**
   * For Drive/Sheets export: prefer session + refresh, then re-auth with OAuth if a Google
   * identity exists but the Drive scope token is missing.
   */
  const getGoogleAccessForDrive = useCallback(async (): Promise<GoogleDriveAccessResult> => {
    try {
      const { data: { session: initial } } = await supabase.auth.getSession();
      if (!initial?.user) {
        return { status: 'needs_sign_in' };
      }

      const readToken = (s: typeof initial) =>
        s?.provider_token && s.provider_token.length > 0 ? s.provider_token : null;

      let token = readToken(initial);
      if (token) {
        return { status: 'ready', accessToken: token };
      }

      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (!refreshError && refreshData.session) {
        token = readToken(refreshData.session);
        if (token) {
          return { status: 'ready', accessToken: token };
        }
      }

      if (userHasGoogleIdentity(initial.user)) {
        return { status: 'needs_reauthorization' };
      }

      return { status: 'needs_google_connect' };
    } catch (error) {
      console.error('getGoogleAccessForDrive error:', error);
      return { status: 'needs_sign_in' };
    }
  }, [supabase]);

  return {
    ...authStatus,
    signIn,
    signOut,
    getAccessToken,
    getGoogleAccessForDrive,
  };
}
