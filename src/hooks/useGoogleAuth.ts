'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GoogleAuthStatus } from '@/types/google';

export function useGoogleAuth() {
  const [authStatus, setAuthStatus] = useState<GoogleAuthStatus>({
    isAuthenticated: false,
    hasRequiredScopes: false,
    user: null,
    loading: true,
  });

  const supabase = createClient();

  useEffect(() => {
    // Check initial auth status
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

        // Check if user authenticated with Google and has required scopes
        const { data: { session } } = await supabase.auth.getSession();
        const hasGoogleProvider = session?.user?.app_metadata?.provider === 'google';
        const hasProviderToken = !!session?.provider_token;

        setAuthStatus({
          isAuthenticated: true,
          hasRequiredScopes: hasGoogleProvider && hasProviderToken,
          user,
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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const hasGoogleProvider = session.user.app_metadata?.provider === 'google';
          const hasProviderToken = !!session.provider_token;

          setAuthStatus({
            isAuthenticated: true,
            hasRequiredScopes: hasGoogleProvider && hasProviderToken,
            user: session.user,
            loading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthStatus({
            isAuthenticated: false,
            hasRequiredScopes: false,
            user: null,
            loading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async () => {
    try {
      setAuthStatus(prev => ({ ...prev, loading: true }));

      const baseUrl = window.location.origin;
      const nextPath = `${window.location.pathname}${window.location.search}`;
      const redirectUrl = `${baseUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
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
  };

  const signOut = async () => {
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
  };

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.provider_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };

  return {
    ...authStatus,
    signIn,
    signOut,
    getAccessToken,
  };
}
