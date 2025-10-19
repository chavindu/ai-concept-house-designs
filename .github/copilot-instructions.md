This project is a Next.js 14 + TypeScript web app that generates architectural house-concept images using Google Gemini and Supabase for auth/data.

Keep guidance concise and focused on repository-specific patterns and examples. Use these quick facts to be immediately productive.

- Big picture
  - Frontend: app/ (Next.js app router). Pages use React + Tailwind; key UI pieces live in `components/` (notably `design-generator.tsx`, `design-canvas.tsx`).
  - Server/API: Next.js API routes under `app/api/*`. AI calls are orchestrated in `lib/ai-service.ts` and prompt construction in `lib/prompt-generator.ts`.
  - State: client-side shared state uses `lib/design-context.tsx` (DesignProvider + useDesign hooks).
  - Auth/Data: Supabase used for auth, profiles, points. Server middleware in `middleware.ts` creates a Supabase server client and refreshes cookies for `/dashboard` and `/admin/:path*`.

- Key integration points (change carefully)
  - `lib/ai-service.ts`: orchestration for Gemini image generation and editing. Contains retry logic, backoff, base64 handling, and Vercel Blob upload fallbacks. Any change here affects the generation flow and error handling shown to users.
  - `lib/prompt-generator.ts`: canonical prompt shape and architectural style blocks. Use for all changes to prompt text or style vocab.
  - `lib/blob-service.ts` (used by `ai-service`): responsible for image uploads. Work here impacts storage and URLs returned to the UI.
  - `app/api/generate-design` and `app/api/edit-design-perspective` (API routes): they require Bearer token from Supabase session; client calls include `Authorization: Bearer <token>`.

- Developer workflows & useful commands
  - Run locally: `pnpm install` (or `npm install`) then `pnpm dev` / `npm run dev` to start Next dev server. Scripts in `package.json` are standard: `dev`, `build`, `start`, `lint`.
  - Database: SQL migration scripts live in `scripts/*.sql` and must be applied to the Supabase project (use Supabase SQL Editor). They are not auto-run by the repo.
  - Environment: copy `env.example` -> `.env.local` and fill required keys: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GOOGLE_AI_API_KEY, SMTP_*, PAYHERE_*, NEXT_PUBLIC_SITE_URL.

- Patterns & conventions
  - Error-as-text fallback: AI failures intentionally return a data:text/plain;base64,... URL (see `lib/ai-service.ts`). UIs detect `data:text/` and show the underlying message instead of an image. Preserve this behavior unless explicitly changing UI handling.
  - Points model: 1 generation = 1 point. Points logic is surfaced in UI (`components/design-generator.tsx`) and stored in `profiles` table (Supabase). Keep any changes synchronized across front-end checks, API routes, and DB scripts.
  - Prompt canonicalization: `lib/prompt-generator.ts` converts form data to a structured prompt (includes land-unit normalization and floor constraints). When changing form fields, update prompt generation accordingly.
  - Client/server token flow: client obtains Supabase session token and sends it as `Authorization: Bearer <token>` to API endpoints. Middleware uses `createServerClient` and touches auth to keep cookies refreshed.

- Code edits: quick pointers
  - To change visual copy or prompt samples, edit `lib/prompt-generator.ts` and `components/design-generator.tsx` (prompt preview UI). Add tests or a small script that generates example prompts and verifies length/format.
  - To update generation retry/backoff behavior, modify `lib/ai-service.ts`. Note: the file contains multiple console logs relied-on during debugging; keep logs informative.
  - To change storage provider (Vercel Blob is planned), update `lib/blob-service.ts` and keep `ai-service` fallbacks intact.

- Files to inspect for context when making changes
  - `README.md` (project overview & env vars)
  - `lib/ai-service.ts` (AI orchestration + retries + upload flow)
  - `lib/prompt-generator.ts` (prompt rules & style blocks)
  - `lib/design-context.tsx` (client-side state contract)
  - `components/design-generator.tsx`, `components/design-canvas.tsx` (UX flow for generation/editing)
  - `middleware.ts` (Supabase server client + auth cookie handling)
  - `scripts/*.sql` (DB schema and required migrations)

- Safety and non-functional notes
  - Do not commit secrets or API keys. `.env.local` must be configured per-developer or CI.
  - Rate limiting: the app expects 20 generations/hour per user; changing limits should be coordinated with both server and UI.
  - Tests: there are no automated tests in the repo. Add small unit tests for `lib/prompt-generator.ts` when changing prompt logic.

- Example quick tasks (how to be useful immediately)
  - Add a unit test that verifies floor count validation in `lib/prompt-generator.ts`.
  - Improve log messages in `lib/ai-service.ts` to include request IDs (preserve existing format to avoid noisy diffs).
  - Wire Vercel Blob upload by implementing `lib/blob-service.ts` upload helpers and keep base64 fallback.

If any section is unclear or you want a different level of detail (API route shapes, example prompts, or a small test added), tell me which part to expand and I will update this file.
