import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BillingPeriod,
  CalculationDirection,
  HistoryRecord,
  TariffSnapshot,
} from '@/types'
import { HISTORY_LIMIT, STORAGE_KEY } from '@/types'
import type { AppLang } from '@/i18n/ui'
import { regulators, tariffCategories } from '@/data/tariffs.data'
import { resolveInitialLang } from '@/i18n/utils'

export type LumioState = {
  tariffId: string
  regulatorId: string
  pricePerKwh: number
  fixedCharge: number
  publicLightingCharge: number
  period: BillingPeriod
  igvRate: number
  isTaxEnabled: boolean
  isFixedChargeEnabled: boolean
  isPublicLightingEnabled: boolean
  direction: CalculationDirection
  inputKwh: number
  inputMoney: number
  records: HistoryRecord[]
  activeLang: AppLang
  langResolved: boolean
}

export type LumioAction = {
  setPricePerKwh: (pricePerKwh: number) => void
  setFixedCharge: (fixedCharge: number) => void
  setPublicLightingCharge: (publicLightingCharge: number) => void
  setPeriod: (period: BillingPeriod) => void
  setTariff: (id: string) => void
  setRegulator: (id: string) => void
  setIgvRate: (igvRate: number) => void
  setIsTaxEnabled: (enabled: boolean) => void
  setIsFixedChargeEnabled: (enabled: boolean) => void
  setIsPublicLightingEnabled: (enabled: boolean) => void
  setDirection: (direction: CalculationDirection) => void
  setInputKwh: (inputKwh: number) => void
  setInputMoney: (inputMoney: number) => void
  setActiveLang: (lang: AppLang) => void
  addRecord: (record: Omit<HistoryRecord, 'id' | 'createdAt' | 'snapshot'>) => void
  removeRecord: (id: string) => void
  clearRecords: () => void
  resetAll: () => void
}

const baseRegulator = regulators[0]
const baseTariff =
  tariffCategories.find((t) => t.regulatorId === baseRegulator.id) ??
  tariffCategories[0]

function buildSnapshot(state: LumioState): TariffSnapshot {
  return {
    tariffId: state.tariffId,
    regulatorId: state.regulatorId,
    pricePerKwh: state.pricePerKwh,
    fixedCharge: state.fixedCharge,
    publicLightingCharge: state.publicLightingCharge,
    igvRate: state.igvRate,
    isFixedChargeEnabled: state.isFixedChargeEnabled,
    isPublicLightingEnabled: state.isPublicLightingEnabled,
    isTaxEnabled: state.isTaxEnabled,
    period: state.period,
  }
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`
}

const initialData: LumioState = {
  tariffId: baseTariff.id,
  regulatorId: baseTariff.regulatorId,
  pricePerKwh: baseTariff.pricePerKwh,
  fixedCharge: baseTariff.fixedCharge,
  publicLightingCharge: baseTariff.publicLightingCharge,
  period: baseTariff.billingPeriod,
  igvRate: 0.18,
  isTaxEnabled: true,
  isFixedChargeEnabled: true,
  isPublicLightingEnabled: true,
  direction: 'kwh-to-money',
  inputKwh: 0,
  inputMoney: 0,
  records: [],
  activeLang: 'es',
  langResolved: false,
}

export const useLumioStore = create<LumioState & LumioAction>()(
  persist(
    (set) => ({
      ...initialData,

      setPricePerKwh: (pricePerKwh) => set({ pricePerKwh }),
      setFixedCharge: (fixedCharge) => set({ fixedCharge }),
      setPublicLightingCharge: (publicLightingCharge) =>
        set({ publicLightingCharge }),
      setPeriod: (period) => set({ period }),
      setTariff: (id) => {
        const tariff = tariffCategories.find((t) => t.id === id)
        if (tariff) {
          set({
            tariffId: tariff.id,
            regulatorId: tariff.regulatorId,
            pricePerKwh: tariff.pricePerKwh,
            fixedCharge: tariff.fixedCharge,
            publicLightingCharge: tariff.publicLightingCharge,
            period: tariff.billingPeriod,
          })
        }
      },
      setRegulator: (id) => {
        const tariff = tariffCategories.find((t) => t.regulatorId === id)
        if (tariff) {
          set({
            tariffId: tariff.id,
            regulatorId: tariff.regulatorId,
            pricePerKwh: tariff.pricePerKwh,
            fixedCharge: tariff.fixedCharge,
            publicLightingCharge: tariff.publicLightingCharge,
            period: tariff.billingPeriod,
          })
        }
      },
      setIgvRate: (igvRate) => set({ igvRate }),
      setIsTaxEnabled: (isTaxEnabled) => set({ isTaxEnabled }),
      setIsFixedChargeEnabled: (isFixedChargeEnabled) =>
        set({ isFixedChargeEnabled }),
      setIsPublicLightingEnabled: (isPublicLightingEnabled) =>
        set({ isPublicLightingEnabled }),
      setDirection: (direction) => set({ direction }),
      setInputKwh: (inputKwh) => set({ inputKwh }),
      setInputMoney: (inputMoney) => set({ inputMoney }),
      setActiveLang: (activeLang) => set({ activeLang, langResolved: true }),
      addRecord: (record) =>
        set((state) => ({
          records: [
            ...state.records,
            {
              ...record,
              id: createId(),
              createdAt: new Date().toISOString(),
              snapshot: buildSnapshot(state),
            },
          ].slice(-HISTORY_LIMIT),
        })),
      removeRecord: (id) =>
        set((state) => ({
          records: state.records.filter((r) => r.id !== id),
        })),
      clearRecords: () => set({ records: [] }),
      resetAll: () =>
        set((state) => ({
          ...initialData,
          records: state.records,
          activeLang: state.activeLang,
          langResolved: state.langResolved,
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return initialData
        const state = persisted as Partial<LumioState>
        // Resolve language inside rehydration so it lands with the rest:
        // stored choice wins, else browser, else default (first visit only).
        const langResolved = state.langResolved === true
        const activeLang = langResolved
          ? (state.activeLang ?? initialData.activeLang)
          : resolveInitialLang(state.activeLang)
        return { ...initialData, ...state, activeLang, langResolved: true }
      },
      partialize: (state) => ({
        tariffId: state.tariffId,
        regulatorId: state.regulatorId,
        pricePerKwh: state.pricePerKwh,
        fixedCharge: state.fixedCharge,
        publicLightingCharge: state.publicLightingCharge,
        period: state.period,
        igvRate: state.igvRate,
        isTaxEnabled: state.isTaxEnabled,
        isFixedChargeEnabled: state.isFixedChargeEnabled,
        isPublicLightingEnabled: state.isPublicLightingEnabled,
        direction: state.direction,
        inputKwh: state.inputKwh,
        inputMoney: state.inputMoney,
        records: state.records,
        activeLang: state.activeLang,
        langResolved: state.langResolved,
      }),
    }
  )
)
