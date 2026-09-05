import { Input } from "./ui/input";
import { Separator } from "./ui/separator";

export const CountTotal = () => {
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-end mt-4">
        <p>Consumo</p>
        <p className="flex gap-2 items-end">
          <Input
            type="number"
            placeholder="0"
            className="text-4xl! h-8 text-right outline-none ring-0 border-transparent bg-background!
                     focus-visible:outline-none focus-visible:ring-0 focus-visible:border-transparent font-mono"
          />
          <span>kWh</span>
        </p>
      </div>
      <Separator className="my-5" />
      <p className="text-sm brightness-60">Enter guardar en historial</p>
    </div>
  );
};
