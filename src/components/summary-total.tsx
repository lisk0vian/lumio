type SummaryTotalProp = {
  total: number;
  surchages?: string[]; // tax, charge, fee, etc.
};

export const SummaryTotal = ({ total, surchages }: SummaryTotalProp) => {
  return (
    <div>
      <p className="text-9xl py-5 font-thin font-mono">S/ {total.toFixed(2)}</p>
      <p className="text-primary">{surchages?.join(" · ")}</p>
    </div>
  );
};
