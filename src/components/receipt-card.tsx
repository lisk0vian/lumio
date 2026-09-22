import {
  Building2,
  CalendarClock,
  CalendarDays,
  HandCoins,
  Lightbulb,
  Percent,
  PlugZap,
  Receipt,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type ReceiptLineKind =
  | 'energy'
  | 'fixed'
  | 'lighting'
  | 'subtotal'
  | 'igv'
  | 'total'

export type ReceiptLine = {
  kind: ReceiptLineKind
  label: string
  money: string
}

export type ReceiptCardProps = {
  brandName: string
  projectionTitle: string
  emittedLabel: string
  emittedAt: string
  kwhValue: string
  kwhUnit: string
  lines: ReceiptLine[]
  tariffLabel: string
  periodLabel: string
  estimateNote: string
}

// Capture-safe palette: every visual inside this node is an inline hex/rgb
// literal. No Tailwind color or font-theme classes here: Tailwind v4 emits
// oklch()/color-mix(), which DOM-to-image engines cannot re-parse.
// Mismos valores en hex del papel cálido / tinta cálida de la app: con los
// neutros previos el PNG exportado se veía fuera de marca junto a la interfaz.
const INK = '#191713'
const MUTED = '#6b6459'
const PAPER = '#faf9f4'
const HAIRLINE = '#e1ddd2'
const DASH = '#c9c2b4'
const ACCENT = '#ffc61a'
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace"
const SANS = "'Inter', system-ui, -apple-system, sans-serif"

const LINE_ICONS: Record<ReceiptLineKind, LucideIcon | null> = {
  energy: PlugZap,
  fixed: Receipt,
  lighting: Lightbulb,
  subtotal: HandCoins,
  igv: Percent,
  total: null,
}

function ReceiptRow({ line }: { line: ReceiptLine }) {
  const Icon = LINE_ICONS[line.kind]
  const isTotal = line.kind === 'total'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '12px',
        padding: isTotal ? '10px 12px' : '6px 0',
        margin: isTotal ? '8px -12px 0' : 0,
        backgroundColor: isTotal ? ACCENT : 'transparent',
        color: INK,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: SANS,
          fontSize: isTotal ? '14px' : '12px',
          fontWeight: isTotal ? 700 : 400,
        }}
      >
        {Icon ? <Icon size={13} aria-hidden="true" /> : null}
        {line.label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: isTotal ? '16px' : '12.5px',
          fontWeight: isTotal ? 700 : 500,
          whiteSpace: 'nowrap',
        }}
      >
        {line.money}
      </span>
    </div>
  )
}

export const ReceiptCard = ({
  brandName,
  projectionTitle,
  emittedLabel,
  emittedAt,
  kwhValue,
  kwhUnit,
  lines,
  tariffLabel,
  periodLabel,
  estimateNote,
}: ReceiptCardProps) => {
  return (
    <div
      style={{
        width: '400px',
        backgroundColor: PAPER,
        color: INK,
        padding: '28px',
        fontFamily: SANS,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            backgroundColor: ACCENT,
            color: INK,
          }}
        >
          <Zap size={17} aria-hidden="true" />
        </span>
        <span>
          <span
            style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            {brandName}
          </span>
          <span style={{ display: 'block', fontSize: '11px', color: MUTED }}>
            {projectionTitle}
          </span>
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '12px',
          fontSize: '11px',
          color: MUTED,
        }}
      >
        <CalendarClock size={12} aria-hidden="true" />
        <span>
          {emittedLabel}: {emittedAt}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: `1px dashed ${DASH}`,
        }}
      >
        <span
          style={{ fontFamily: MONO, fontSize: '30px', fontWeight: 700 }}
        >
          {kwhValue}
        </span>
        <span style={{ fontFamily: MONO, fontSize: '13px', color: MUTED }}>
          {kwhUnit}
        </span>
      </div>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px dashed ${DASH}`,
        }}
      >
        {lines.map((line) => (
          <ReceiptRow key={line.kind} line={line} />
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: `1px dashed ${DASH}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          color: MUTED,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Building2 size={12} aria-hidden="true" />
          {tariffLabel}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CalendarDays size={12} aria-hidden="true" />
          {periodLabel}
        </span>
        <span
          style={{
            marginTop: '4px',
            paddingTop: '8px',
            borderTop: `1px solid ${HAIRLINE}`,
            fontSize: '10.5px',
          }}
        >
          {estimateNote}
        </span>
      </div>
    </div>
  )
}
