interface SummaryTotalProp {
  total: number;
  className?: string;
  surchages?: string[]; // tax, charge, fee, etc.
}

export const SummaryTotal = ({
  total,
  surchages,
  className: styles,
}: SummaryTotalProp) => {
  return (
    <div className={`${styles}`}>
      <p className="uppercase font-medium tracking-wide text-foreground/60 py-2 mb-4">Total A Pagar</p>
      <p className="text-9xl py-5 font-thin font-mono">S/ {total.toFixed(2)}</p>
      <p className="text-primary font-medium">{surchages?.join(" · ")}</p>
    </div>
  );
};
