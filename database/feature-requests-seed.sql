-- Seed default roadmap items (idempotent: skips existing titles)
-- Run in Supabase SQL Editor after public.feature_requests exists.
-- Uses dollar-quoting so "smart quotes" or apostrophes in text cannot break the parse.

INSERT INTO public.feature_requests (title, description, votes_count, status)
SELECT $t$Notion integration$t$, $d$
Push tables straight into Notion databases and linked pages with one click.
$d$, 0, $s$Planned$s$
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests fr WHERE fr.title = $t$Notion integration$t$);

INSERT INTO public.feature_requests (title, description, votes_count, status)
SELECT $t$AI Vision capture$t$, $d$
Extract structured tables from screenshots, scans, and embedded images using AI vision.
$d$, 0, $s$Under Review$s$
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests fr WHERE fr.title = $t$AI Vision capture$t$);

INSERT INTO public.feature_requests (title, description, votes_count, status)
SELECT $t$Advanced PDF toolkit$t$, $d$
Extra PDF layouts, headers and footers, batch branding, and merge options.
$d$, 0, $s$Under Review$s$
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests fr WHERE fr.title = $t$Advanced PDF toolkit$t$);

INSERT INTO public.feature_requests (title, description, votes_count, status)
SELECT $t$Custom cleanup rules$t$, $d$
Save reusable sanitization rules—regex, column mappings—before every export.
$d$, 0, $s$Under Review$s$
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests fr WHERE fr.title = $t$Custom cleanup rules$t$);

INSERT INTO public.feature_requests (title, description, votes_count, status)
SELECT $t$Developer API$t$, $d$
REST API keys to convert and fetch tables from scripts, CI, and backends.
$d$, 0, $s$Under Review$s$
WHERE NOT EXISTS (SELECT 1 FROM public.feature_requests fr WHERE fr.title = $t$Developer API$t$);
