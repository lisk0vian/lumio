import React from 'react'
import { SummaryTotal } from './summary-total'
import { ConversionToggle } from './conversion-toggle'
import { CountTotal } from './count-total'
import { ReceiptDetails } from './receipt-details'
import { HistoryDetails } from './history-details'
import type { Receipt } from '@/types'
import { SectionBlock } from './section'
import { SettingOptions } from './setting-options'

type MainProps = {
  receipts: Receipt[]
  records: { kwh: number; money: number }[]
}

export const Main: React.FC<MainProps> = ({ receipts, records }) => {

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
        <div className="bg-blue-400 rounded-2xl w-full h-full flex justify-center items-center font-black text-white">
          2
        </div>
        <SettingOptions />
      </main>
    </div>
  )
}
