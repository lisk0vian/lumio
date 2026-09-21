// Estimated monthly savings for each tip. Every kwhPerMonth is derived
// from the assumptions in its comment -- redo the math if you change them.
// All values are approximations for a Lima household, not meter readings.

import type { I18nKey } from '@/i18n/utils'

export interface SavingTipData {
  id: string
  /** Estimated kWh saved per month. */
  kwhPerMonth: number
  /** i18n key for the tip text. */
  textKey: I18nKey
}

export const savingTips: SavingTipData[] = [
  {
    id: 'led',
    // 6 bulbs x (100W - 14W) x 3h/day x 30 days = 46.44 kWh
    kwhPerMonth: 46.4,
    textKey: 'tip.1',
  },
  {
    id: 'shower',
    // 4500W x (10/60)h/day x 30 days = 22.5 kWh
    kwhPerMonth: 22.5,
    textKey: 'tip.2',
  },
  {
    id: 'bulbs-off',
    // 2 bulbs x 60W x 4h/day x 30 days = 14.4 kWh
    kwhPerMonth: 14.4,
    textKey: 'tip.3',
  },
  {
    id: 'standby',
    // 3 devices x 5W x 20h/day x 30 days = 9.0 kWh
    kwhPerMonth: 9.0,
    textKey: 'tip.4',
  },
  {
    id: 'cold-wash',
    // Heating 20L 20C -> 40C per load: 20 x 4.186 x 20 = 1674 kJ = 0.465 kWh;
    // 3 loads/week x 4.33 = ~13 loads x 0.465 = 6.0 kWh
    kwhPerMonth: 6.0,
    textKey: 'tip.5',
  },
  {
    id: 'tv',
    // 80W x 2h/day x 30 days = 4.8 kWh
    kwhPerMonth: 4.8,
    textKey: 'tip.6',
  },
]
