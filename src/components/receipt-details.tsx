import type { Receipt } from "@/types";

interface ReceiptDetailsProps {
  receipts: Receipt[];
}

export const ReceiptDetails = ({ receipts }: ReceiptDetailsProps) => {
  return (
    <div className="w-full">
      <p className="uppercase text-xs font-semibold my-2 text-foreground/60">
        Desglose del recibo
      </p>
      {receipts.map(({ label, money }, idx) => (
        <ReceiptField key={idx} label={label} money={Number(money)} />
      ))}
    </div>
  );
};

const ReceiptField = ({ label, money }: Receipt) => (
  <div className="flex justify-between font-mono text-sm">
    <p className="capitalize">{label}</p>
    <p className="text-foreground/90">S/ {money.toFixed(2)}</p>
  </div>
);
