import type { User } from '@supabase/supabase-js';

function getRecordValue(record: unknown, key: string): unknown {
  if (!record || typeof record !== 'object') {
    return undefined;
  }
  return (record as Record<string, unknown>)[key];
}

function getStringValue(record: unknown, key: string): string | null {
  const value = getRecordValue(record, key);
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getGoogleUserAvatarUrl(user: User | null): string | null {
  if (!user) return null;

  const directSources = [
    getStringValue(getRecordValue(user, 'user_metadata'), 'avatar_url'),
    getStringValue(getRecordValue(user, 'user_metadata'), 'picture'),
  ];

  const identities = getRecordValue(user, 'identities');
  const identitySources = Array.isArray(identities)
    ? identities.flatMap((identity) => {
        const identityData = getRecordValue(identity, 'identity_data');
        return [
          getStringValue(identityData, 'avatar_url'),
          getStringValue(identityData, 'picture'),
          getStringValue(identityData, 'photo_url'),
        ];
      })
    : [];

  const avatarUrl =
    [...directSources, ...identitySources].find(
      (value): value is string => typeof value === 'string' && value.length > 0,
    ) ?? null;
  return avatarUrl;
}

/**
 * True if the user can use Google OAuth (linked Google identity or Google-only sign-in).
 * Do not rely on app_metadata.provider alone — Supabase can expose Google via identities[].
 */
export function userHasGoogleIdentity(user: User | null | undefined): boolean {
  if (!user) return false;
  if (user.app_metadata?.provider === 'google') return true;
  const providers = user.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes('google')) return true;
  if (user.identities?.some((i) => i.provider === 'google')) return true;
  return false;
}

export function getGoogleUserDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = meta?.full_name;
  const name = meta?.name;
  if (typeof fullName === 'string' && fullName.length > 0) return fullName;
  if (typeof name === 'string' && name.length > 0) return name;
  const emailLocal = user.email?.split('@')[0];
  if (emailLocal && emailLocal.length > 0) return emailLocal;
  return 'User';
}
