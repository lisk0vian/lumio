type SummaryTotalProp = {
  total: number;
  surchages?: string[]; // tax, charge, fee, etc.
};

export const SummaryTotal = ({ total, surchages }: SummaryTotalProp) => {
  return (
    <div>
      <p className="font-mono text-[clamp(3.5rem,12vw,5.375rem)] leading-[1.06] font-medium tracking-tight tabular-nums 2xl:text-[7rem]">
        S/ {total.toFixed(2)}
      </p>
      <p className="font-mono text-sm font-medium text-primary">{surchages?.join(' · ')}</p>
    </div>
  )
}
