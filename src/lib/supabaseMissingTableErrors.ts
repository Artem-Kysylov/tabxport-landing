function matchesMissingPublicTable(message: string, tableName: string): boolean {
  const m = message.toLowerCase();
  const t = tableName.toLowerCase();
  if (!m.includes(t)) return false;
  return (
    m.includes('schema cache') ||
    m.includes('could not find') ||
    m.includes('does not exist') ||
    (m.includes('relation') && m.includes(t))
  );
}

/** Supabase/PostgREST when `public.exports` was never migrated */
export function isExportsTableMissingError(message: string): boolean {
  return matchesMissingPublicTable(message, 'exports');
}

/** Supabase/PostgREST when `public.feature_requests` was never migrated */
export function isFeatureRequestsTableMissingError(message: string): boolean {
  return matchesMissingPublicTable(message, 'feature_requests');
}
