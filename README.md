<div align="center">

# Lumio

**Turn kWh into soles in seconds. A transparent electricity-bill calculator for Peru.**

[Live demo](https://lisk0vian.github.io/lumio/) · [English](https://lisk0vian.github.io/lumio/en/) · [How the math works](https://lisk0vian.github.io/lumio/en/calculation)

[![CI](https://github.com/lisk0vian/lumio/actions/workflows/ci.yml/badge.svg)](https://github.com/lisk0vian/lumio/actions/workflows/ci.yml)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![React](https://img.shields.io/badge/React-19-087EA4?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![Base UI](https://img.shields.io/badge/Base_UI-1-0B0D0E)](https://base-ui.com)
[![zustand](https://img.shields.io/badge/zustand-5-443E38)](https://zustand.docs.pmnd.rs)
[![anime.js](https://img.shields.io/badge/anime.js-4-FF4B4B)](https://animejs.com)
[![snapdom](https://img.shields.io/badge/snapdom-3-5A4FCF)](https://github.com/zumerlab/snapdom)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev)
[![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-deployed-222222?logo=githubpages&logoColor=white)](https://lisk0vian.github.io/lumio/)

<a href="docs/demo-en.mp4"><img src="docs/demo.gif" alt="20-second tour: typing 120 kWh gives S/ 89.88, the receipt breaks down each charge, the consumption scale lands on Normal, and the receipt is shared" width="900"></a>

<sub>Click the animation to open the full-quality MP4.</sub>

</div>

---

## Purpose

In Peru the electricity bill (*recibo de luz*) folds energy use, a fixed charge, public lighting and 18% IGV into one number. That makes everyday questions hard to answer:

- *"If I use 120 kWh this month, how much will I pay?"*
- *"I have S/ 100 budgeted. How many kWh is that?"*
- *"Is my usage normal, or should I cut back?"*

Lumio answers all three instantly, from the same four figures printed on any bill. Everything runs in the browser, with no account, no backend and no tracking.

**Who it's for:** households checking their bill, people splitting it with roommates or family, and anyone budgeting their monthly spend.

---

## The product

### Convert in both directions

Type kWh to get soles, or type soles to get kWh. The reverse direction is the exact inverse of the same formula, so converting back and forth always returns the original value.

| kWh → S/ | S/ → kWh |
|---|---|
| <img src="docs/screenshots/convert-kwh.png" alt="120 kWh converted to S/ 89.88"> | <img src="docs/screenshots/convert-money.png" alt="S/ 100 converted to 134.0 kWh"> |

### Every sol, itemized

The breakdown updates as you type. The level scale tells you where your usage falls, with text labels as well as color.

| Bill breakdown | Consumption level |
|---|---|
| <img src="docs/screenshots/breakdown.png" alt="Bill breakdown for 120 kWh: energy, fixed charge, public lighting, subtotal, IGV and total S/ 89.88"> | <img src="docs/screenshots/level.png" alt="Consumption level scale with Normal (70-140 kWh) highlighted"> |

### Track your spending

Press Enter to save a calculation. Lumio keeps your history on the device and summarizes it.

<p align="center"><img src="docs/screenshots/history-summary.png" alt="Saved calculations: average expense, average consumption, min and max expense, plus reference values for 100, 200 and 300 kWh" width="480"></p>

### Share the receipt

This is the actual PNG Lumio exports, rendered from the DOM with snapdom. It can be copied, downloaded, sent through the native share sheet, or posted to WhatsApp as formatted text.

<p align="center"><img src="docs/screenshots/receipt-en.png" alt="Exported Lumio receipt image: 120 kWh, itemized charges and a total of S/ 89.88" width="380"></p>

### Your tariff, your rules

Choose the regulator and tariff, edit the price per kWh, switch each charge on or off, and pick monthly or bimonthly billing.

<p align="center"><img src="docs/screenshots/settings-bar.png" alt="Settings bar: OSINERGMIN regulator, BT5B residential tariff, price per kWh, fixed charge and lighting toggles, IGV and period"></p>

### Mobile first

Under 1024 px the layout becomes three tabs. The desktop-only parts of the app are never downloaded on a phone.

| Calculate | History | Settings |
|---|---|---|
| <img src="docs/screenshots/mobile-calculate.png" alt="Mobile calculator showing S/ 89.88 for 120 kWh" width="250"> | <img src="docs/screenshots/mobile-history.png" alt="Mobile history with averages and saved records" width="250"> | <img src="docs/screenshots/mobile-settings.png" alt="Mobile settings" width="250"> |

### Dark mode

Follows the system preference on first visit, and the toggle in the header remembers your choice.

<p align="center"><img src="docs/screenshots/convert-dark.png" alt="Converter in dark theme" width="720"></p>

---

## How the calculation works

```
subtotal = kWh × price per kWh + fixed charge + public lighting
total    = (subtotal + subtotal × 18% IGV) × period      period: 1 monthly, 2 bimonthly
```

| 120 kWh on residential BT5B | Amount |
|---|---:|
| Energy · 120 kWh × S/ 0.6144 | S/ 73.73 |
| Fixed charge | S/ 2.34 |
| Public lighting | S/ 0.10 |
| **Subtotal** | **S/ 76.17** |
| IGV · 18% | S/ 13.71 |
| **Total** | **S/ 89.88** |

> [!NOTE]
> The BT5B residential tariff was verified against a real June 2026 Lima Norte bill. The other categories in [`src/data/tariffs.data.ts`](src/data/tariffs.data.ts) are estimates that users can edit in the settings bar.

---

## Architecture

Lumio is a static site. Astro renders the pages to HTML at build time, and React runs only inside the interactive islands. The islands share one store, and all the math lives in pure, tested functions.

```mermaid
flowchart LR
    A["Astro build<br/>static HTML · es / en"] --> B["React islands<br/>calculator · receipt · level · share"]
    B <--> C[("zustand store")]
    C <--> D[("localStorage")]
    C --> E["Tariff math<br/>pure functions"]

    classDef build fill:#191713,stroke:#191713,color:#faf9f4
    classDef ui fill:#ffc61a,stroke:#e0a800,color:#191713
    classDef data fill:#faf9f4,stroke:#a44c1d,color:#191713
    class A build
    class B ui
    class C,D,E data
```

| Decision | Why |
|---|---|
| Static output instead of an SPA | The page is mostly content. Prerendered HTML loads fast and is free to host on GitHub Pages. |
| React only in islands, loaded on demand | Desktop-only islands are never downloaded on mobile, and content below the fold hydrates when it becomes visible. |
| One store with versioned migrations | Islands stay in sync without prop drilling, and saved history survives schema changes. |
| Language in the URL | `/` and `/en/` are real, shareable, crawlable pages. |
| Pure, memoized math | Easy to unit-test, and computed once per change instead of once per island. |

---

## Getting started

Requires Node.js 22.12 or later and pnpm.

```bash
git clone https://github.com/lisk0vian/lumio.git
cd lumio
pnpm install
pnpm dev          # http://localhost:4321/lumio/
```

| Script | Purpose |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build to `dist/` |
| `pnpm preview` | Serve the production build |
| `pnpm test` | Unit tests |
| `pnpm typecheck` | `astro check` |
| `pnpm format` | Prettier |

## Author

Built by [@lisk0vian](https://github.com/lisk0vian). Feedback is welcome, so feel free to [open an issue](https://github.com/lisk0vian/lumio/issues).
