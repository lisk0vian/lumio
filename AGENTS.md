# Lumio — agent notes

Peru electricity-bill calculator (kWh → S/). Astro 7 static page + React 19 islands, Tailwind v4, shadcn, zustand. No backend.

## Commands

- Package manager is pnpm (`pnpm-lock.yaml`); Node >=22.12 (`engines` in `package.json`).
- `pnpm dev` / `pnpm build` / `pnpm preview`. No lint, test, or typecheck scripts — verify with `pnpm build`.
- Start the dev server in background: `astro dev --background`; manage with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Architecture

- Entrypoint: `src/pages/index.astro` renders `Layout` + `Main` with `client:load`. All interactive UI is React in `src/components/*.tsx`; `.astro` files are shell only.
- State: zustand stores at `src/tariff-store.ts` (tariff/fee/price/period) and `src/settings-store.ts` (regulator/tax flags). Static tariff data in `src/data/tariffs.data.ts`; pure helpers in `src/utils/tariffs.utils.ts` (no UI code); shared model in `src/types.ts`.
- Import alias `@/*` → `src/*` (`tsconfig.json`, `components.json`). `cn()` lives at `src/lib/utils.ts`.
- Styling is Tailwind v4 CSS-first — no `tailwind.config`; theme tokens live in `src/styles/global.css`. shadcn style `base-mira`, lucide icons. Dark mode is a `.dark` class toggled by the inline script in `src/layouts/Layout.astro` (localStorage + prefers-color-scheme).

## Conventions & gotchas

- Prettier: single quotes, no semicolons (`.prettierrc`) — match existing `.tsx` style.
- Spacing/type doctrine: relative units only (Tailwind scale = rem; `rem`/`em`/unitless/`clamp` where scale lacks the step — never `px`); even-px lattice (no `.25`/`.75` steps); `gap-2` tight clusters vs `gap-3` relational; prototype widths/measures stay untouched.
- Case-sensitive imports: git tracks `src/components/Main.tsx` but the file on disk is `main.tsx`, and `index.astro` imports the lowercase path — works on Windows, breaks on Linux. Keep import paths byte-identical to git-tracked names.
- Tariff prices are approximate and user-editable; only `osinergmin-bt5b-residential` is verified (real June 2026 Lima Norte bill). Update source: osinergmin.gob.pe pliegos tarifarios. No `Distributor` entity by design (see `src/types.ts`).
- Load the `vercel-react-best-practices` skill (`.agents/skills/`) before writing or refactoring React components.
