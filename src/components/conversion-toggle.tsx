import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export const ConversionToggle = () => {
  return (
    <Tabs defaultValue="s-kwh">
      <TabsList variant="line" className="w-full mt-4 py-6 border-y-2">
        <TabsTrigger className="text-lg font-thin py-[1.27rem]" value="kwh-s">kWh &rarr; S/ </TabsTrigger>
        <TabsTrigger className="text-lg font-thin py-[1.27rem]" value="s-kwh">S/ &rarr; kWh</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
