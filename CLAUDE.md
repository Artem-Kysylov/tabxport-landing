# CLAUDE.md | Project Intelligence & Constraints

## Project-Specific Mission: TableXport
- **Primary Goal:** High-precision table data extraction and multi-format conversion.
- **Priority:** Ensure the parsing logic is robust and memory-efficient for large datasets.
- **DB Focus:** Use `supabase-tablexport` MCP to manage parsing configs and user history.

## Token Efficiency & Economy
- **Context Limit:** Never read the entire directory. Only request specific files relevant to the current task.
- **Surgical Output:** Provide only the changed lines of code. Do not output unchanged parts of a file.
- **Think First:** Spend more tokens on "Thinking Process" to avoid expensive code-generation retries.

## Environment & Tech
- **Stack:** Next.js (App Router), TS, Tailwind, Supabase.
- **Hardware:** MacBook Air M1 (8GB RAM). Avoid memory-intensive background processes.
- **Strict Rules:** No `any` types. Strict TS only. Functional components only.

## Build & Dev Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Type Check: `npm run type-check`

## Code Style Mandates
- **Surgical Edits:** Use precise line replacements.
- **Reuse:** Audit `@/components` before creating new ones.