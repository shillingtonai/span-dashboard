# SKILL.md — Frontend Design for Span.io Dashboard

## Aesthetic Direction

**Concept: Industrial Precision**
Think mission control meets fintech — dark, data-dense, but elegant. Every element has a reason to exist. Nothing decorative for decoration's sake. The green accent (#00E5A0) is a nod to Span.io's energy/electrical brand identity without being on-the-nose.

This is a **client-facing dashboard**, so it needs to feel premium and trustworthy. The client should feel like they're looking at something built for them, not a generic SaaS template.

---

## Color Tokens

```css
:root {
  /* Backgrounds */
  --bg-base: #0A0A0F;
  --bg-surface: #13131A;
  --bg-elevated: #1A1A24;

  /* Borders */
  --border-subtle: #1E1E2E;
  --border-default: #2A2A3E;

  /* Accents */
  --accent-primary: #00E5A0;
  --accent-primary-dim: rgba(0, 229, 160, 0.12);
  --accent-secondary: #3B82F6;
  --accent-secondary-dim: rgba(59, 130, 246, 0.12);

  /* Text */
  --text-primary: #F0F0F5;
  --text-secondary: #A0A0B0;
  --text-muted: #6B7280;

  /* Status */
  --status-up: #00E5A0;
  --status-down: #EF4444;
  --status-neutral: #6B7280;

  /* Chart palette (in order) */
  --chart-1: #00E5A0;
  --chart-2: #3B82F6;
  --chart-3: #F59E0B;
  --chart-4: #8B5CF6;
  --chart-5: #EC4899;
}
```

---

## Typography

Load from Google Fonts in `layout.tsx`:

```typescript
import { DM_Sans, DM_Mono } from 'next/font/google'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['300', '400', '500'],
})
```

**Usage rules:**
- Dashboard title, section headers: `DM Sans` 600–700
- KPI numbers, data values: `DM Mono` 400–500
- Body text, labels, descriptions: `DM Sans` 400
- Chart axis labels: `DM Mono` 300

**Scale:**
- Dashboard title: `text-2xl` (24px)
- Section headers: `text-sm uppercase tracking-widest` (feels more refined than large headers in dense dashboards)
- KPI values: `text-3xl font-mono`
- KPI labels: `text-xs text-muted uppercase tracking-wider`
- Body: `text-sm`

---

## Component Patterns

### KPI Card
```
┌─────────────────────────────┐
│ LABEL              ↑ +12%   │  ← label small/muted, trend right-aligned
│                             │
│ 42,831                      │  ← big mono number
│                             │
│ vs 38,241 last period       │  ← comparison text, muted
└─────────────────────────────┘
```

- Background: `var(--bg-surface)`
- Border: `1px solid var(--border-subtle)`
- Border-radius: `12px`
- Padding: `24px`
- On hover: border shifts to `var(--border-default)`, subtle glow on accent side
- Trend up: accent green with up arrow icon
- Trend down: red with down arrow icon

### Chart Card
```
┌─────────────────────────────────┐
│ SECTION LABEL        [legend]   │
│ ─────────────────────────────   │
│                                 │
│  [recharts chart here]          │
│                                 │
└─────────────────────────────────┘
```

- Same card styles as KPI card
- Section label: `text-xs uppercase tracking-widest text-muted`
- Divider: `1px solid var(--border-subtle)`
- Chart height: 220px for standard, 280px for featured charts
- Remove all Recharts default borders — use custom tooltip styles

### Custom Recharts Tooltip
```typescript
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1A1A24] border border-[#2A2A3E] rounded-lg p-3 text-sm">
      <p className="text-[#6B7280] mb-2 font-mono text-xs">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-mono" style={{ color: entry.color }}>
          {entry.name}: {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  )
}
```

### Loading Skeleton
Use `animate-pulse` with `bg-[#1E1E2E]` rounded shapes that mirror the card layout. Never show a spinning loader — skeletons only.

### Empty/Error State
```
┌─────────────────────────────┐
│                             │
│   ○  No data available      │  ← centered, muted icon + text
│      Check API connection   │
│                             │
└─────────────────────────────┘
```

---

## Layout Grid

```
Header (full width)
────────────────────────────────────────

KPI Cards (6 cards, 3-col on desktop, 2-col on tablet)
[ Card ][ Card ][ Card ]
[ Card ][ Card ][ Card ]

────────────────────────────────────────

Charts Row 1 (2 charts, 60/40 split)
[ Social Traffic — wider ][ Branded Search ]

Charts Row 2 (2 charts, 50/50)
[ Instagram Reach ][ YouTube Views ]

Charts Row 3 (2 charts, 50/50)
[ Installer Inquiries ][ How Did You Hear ]

────────────────────────────────────────

Top Content (2 columns, 50/50)
[ Top Instagram Posts ][ Top YouTube Videos ]

────────────────────────────────────────

Footer
```

---

## Motion & Animation

Keep it subtle — this is a data dashboard, not a landing page.

**On page load:**
- KPI cards stagger in with `animation-delay` (50ms increments)
- Use `opacity: 0 → 1` + `translateY(8px) → 0` — nothing dramatic

**On hover:**
- Cards: `transition: border-color 200ms ease`
- Trend badges: subtle scale `1 → 1.02`

**On data refresh:**
- Numbers count up from 0 using a simple counter animation
- Charts animate in via Recharts' built-in `isAnimationActive`

**Never use:**
- Bouncing, spinning, or elastic animations
- Full-page transitions
- Animations longer than 400ms

---

## Recharts Config Defaults

Apply these to all charts for visual consistency:

```typescript
// Shared axis style
const axisStyle = {
  tick: { fill: '#6B7280', fontSize: 11, fontFamily: 'DM Mono' },
  axisLine: { stroke: '#1E1E2E' },
  tickLine: false,
}

// Shared grid style
const gridStyle = {
  stroke: '#1E1E2E',
  strokeDasharray: '3 3',
}

// Shared chart margins
const chartMargins = { top: 5, right: 10, left: -10, bottom: 0 }
```

---

## Dos and Don'ts

**DO:**
- Use the accent green sparingly — it should pop when it appears
- Keep data labels tight and mono-spaced
- Use uppercase + letter-spacing for section labels (feels more refined than title case in dense UIs)
- Show trend direction clearly — green up, red down, always
- Use consistent border-radius (12px for cards, 6px for badges/chips)

**DON'T:**
- Use white backgrounds anywhere
- Use purple, teal, or orange as primary colors — reserved for chart data only
- Add decorative elements that don't carry data
- Use drop shadows — use borders instead for depth
- Mix font weights aggressively — stick to 400/500/600
