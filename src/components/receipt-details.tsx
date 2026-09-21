import { cn } from '@/lib/utils'
import type { Receipt } from '@/types'

interface ReceiptDetailsProps {
  receipts: Receipt[]
}

export const ReceiptDetails = ({ receipts }: ReceiptDetailsProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-5.5 gap-y-2 font-mono text-[0.8125rem] text-muted-foreground">
      {receipts.map(({ label, money }, idx) => (
        <ReceiptField
          key={idx}
          label={label}
          money={Number(money)}
          isTotal={idx === receipts.length - 1}
        />
      ))}
    </div>
  )
}

const ReceiptField = ({ label, money, isTotal }: Receipt & { isTotal?: boolean }) => (
  <>
    <p className={cn('capitalize', isTotal && 'border-t border-border pt-2 font-medium text-foreground')}>
      {label}
    </p>
    <p className={cn('text-right tabular-nums', isTotal && 'border-t border-border pt-2 font-medium text-foreground')}>
      S/ {money.toFixed(2)}
    </p>
  </>
)
