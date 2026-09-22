type SummaryTotalProp = {
  total: number;
  unit?: 'money' | 'kwh';
  surchages?: string[]; // tax, charge, fee, etc.
};

export const SummaryTotal = ({ total, unit = 'money', surchages }: SummaryTotalProp) => {
  return (
    <div>
      <h1 className="font-mono text-[clamp(3.5rem,12vw,5.375rem)] leading-[1.06] font-medium tracking-tight tabular-nums 2xl:text-[7rem]">
        {unit === 'money' ? `S/ ${total.toFixed(2)}` : `${total.toFixed(1)} kWh`}
      </h1>
      <p className="font-mono text-sm font-medium text-ember">{surchages?.join(' · ')}</p>
    </div>
  )
}
