import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export const ConversionToggle = () => {
  return (
    <Tabs defaultValue="kwh-s">
      <TabsList
        variant="line"
        className="mt-6.5 w-full justify-start gap-8 border-y border-border py-0 2xl:mt-10"
      >
        <TabsTrigger className="flex-1 rounded-none py-3 text-xs font-medium" value="kwh-s">
          kWh &rarr; S/{' '}
        </TabsTrigger>
        <TabsTrigger className="flex-1 rounded-none py-3 text-xs font-medium" value="s-kwh">
          S/ &rarr; kWh
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
