import React from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import { SectionBlock } from './section'
import { SettingOptions } from './setting-options'
import { useTariff } from '@/tariff-store'
import { useSettings } from '@/settings-store'
import { EnergyScale } from './energy-scale'

type MainProps = {
  records: { kwh: number; money: number }[]
}

export const Main: React.FC<MainProps> = ({ records }) => {
  const { fee } = useTariff()
  const { hasTax, tax } = useSettings()

  const receipts = [
    { label: 'Energía · 14 kWh', money: 13.2 },
    { label: 'Cargo Fijo · Mensual', money: fee },
    { label: 'Sub Total · Sin IGV', money: 13 },
    { label: `IGV · ${hasTax ? 'Incluido' : 'Excluido'}`, money: tax },
  ]

  return (
    <div id="container">
      <main className="grid grid-cols-3 grid-rows-[9fr_minmax(100px,1fr)] w-screen h-screen gap-4 place-items-center p-14">
        <div className="col-span-2 w-full h-full flex flex-col justify-start">
          <SectionBlock title="Total a Pagar">
            <SummaryTotal total={0} surchages={['Sin IGV', 'Monto neto']} />
            <ConversionToggle />
            <CountTotal />
          </SectionBlock>
          <div className="flex gap-4 w-full mt-5">
            <SectionBlock title="Desglose del recibo">
              <ReceiptDetails receipts={receipts} />
            </SectionBlock>
            <SectionBlock title="Tus cálculos guardados">
              <HistoryDetails records={records} />
            </SectionBlock>
          </div>
        </div>
        <div className="w-full h-full flex justify-center">
          <SectionBlock title="Tu nivel de consumo">
            <h1 className='text-4xl font-semibold'>Sin Datos</h1>
            <EnergyScale />
          </SectionBlock>
        </div>
        <SettingOptions />
      </main>
    </div>
  )
}
