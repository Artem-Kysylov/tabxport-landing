import { createClient } from '@/lib/supabase/client';
import { ExportRecord, ExportFixStats, ExportTableData } from '@/types/database';
import { ParsedTable } from '@/types/table';
import { FixStats } from '@/lib/sanitizer';

const toExportFixStats = (stats: FixStats): ExportFixStats => ({
  markdown: stats.markdown,
  spaces: stats.spaces,
  numeric: stats.numeric,
  links: stats.links,
});

const toExportTableData = (table: ParsedTable): ExportTableData => ({
  headers: table.data.headers,
  rows: table.data.rows,
});

export async function saveExport(params: {
  table: ParsedTable;
  fixStats: FixStats;
  sourceUrl?: string;
}): Promise<{ data: ExportRecord | null; error: string | null }> {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('exports')
    .insert({
      user_id: user.id,
      table_name: params.table.name,
      data: toExportTableData(params.table) as unknown as Record<string, unknown>,
      fix_stats: toExportFixStats(params.fixStats) as unknown as Record<string, unknown>,
      source_url: params.sourceUrl ?? null,
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExportRecord, error: null };
}

export async function deleteExport(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from('exports').delete().eq('id', id);
  if (error) return { error: error.message };
  return { error: null };
}

export async function fetchExports(): Promise<{
  data: ExportRecord[] | null;
  error: string | null;
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as ExportRecord[], error: null };
}
