import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'
import type { Receipt } from '@/types'
import { isReducedMotion } from '@/utils/animated-number.utils'
import { useAnimatedNumber } from './use-animated-number'

interface ReceiptDetailsProps {
  receipts: Receipt[]
}

export const ReceiptDetails = ({ receipts }: ReceiptDetailsProps) => {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-1.5 font-mono text-xs text-muted-foreground">
      {receipts.map((receipt, idx) => (
        <ReceiptField
          key={receipt.id ?? idx}
          receipt={receipt}
          isTotal={idx === receipts.length - 1}
        />
      ))}
    </div>
  )
}

const ReceiptField = ({ receipt, isTotal }: { receipt: Receipt; isTotal: boolean }) => {
  if (isTotal) return <TotalField receipt={receipt} />
  return <RowField receipt={receipt} />
}

// The total tweens like SummaryTotal (same delta-aware curve); the commit
// flash is skipped here (no element to pulse, the value already moves).
const TotalField = ({ receipt }: { receipt: Receipt }) => {
  const display = useAnimatedNumber(Number(receipt.money), 'money')
  return (
    <>
      <p className={cn('border-t border-border pt-1.5 font-medium capitalize text-foreground')}>
        {receipt.label}
      </p>
      <p className={cn('border-t border-border pt-1.5 text-right font-medium tabular-nums text-foreground')}>
        S/ {display.toFixed(2)}
      </p>
    </>
  )
}

// Breakdown rows update instantly with a subtle flash only when their value
// changed. Newly mounted rows (optional charges toggled on) slide in instead.
const RowField = ({ receipt }: { receipt: Receipt }) => {
  const money = Number(receipt.money)
  const labelRef = useRef<HTMLParagraphElement | null>(null)
  const valueRef = useRef<HTMLParagraphElement | null>(null)
  const animRef = useRef<ReturnType<typeof animate> | null>(null)
  const prevRef = useRef(money)
  const mountedRef = useRef(false)

  useEffect(() => {
    const targets = [labelRef.current, valueRef.current].filter((el) => el !== null)
    if (targets.length === 0 || isReducedMotion()) {
      prevRef.current = money
      mountedRef.current = true
      return
    }
    animRef.current?.cancel()
    if (!mountedRef.current) {
      mountedRef.current = true
      prevRef.current = money
      animRef.current = animate(targets, {
        opacity: [0, 1],
        y: [4, 0],
        duration: 200,
        ease: 'outCubic',
      })
      return
    }
    if (prevRef.current === money) return
    prevRef.current = money
    animRef.current = animate(targets, { opacity: [0.4, 1], duration: 150, ease: 'outCubic' })
  }, [money])

  useEffect(() => {
    return () => {
      animRef.current?.cancel()
    }
  }, [])

  return (
    <>
      <p ref={labelRef} className="capitalize">
        {receipt.label}
      </p>
      <p ref={valueRef} className="text-right tabular-nums">
        S/ {money.toFixed(2)}
      </p>
    </>
  )
}
