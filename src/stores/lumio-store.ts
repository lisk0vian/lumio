import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  BillingPeriod,
  CalculationDirection,
  HistoryRecord,
  TariffSnapshot,
} from '@/types'
import { HISTORY_LIMIT, STORAGE_KEY } from '@/types'
import { regulators, tariffCategories } from '@/data/tariffs.data'
import {
  calculateKwhToMoney,
  calculateMoneyToKwh,
} from '@/utils/tariffs.utils'

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
  setDirectionWithConversion: (direction: CalculationDirection) => void
  setInputKwh: (inputKwh: number) => void
  setInputMoney: (inputMoney: number) => void
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
      setDirectionWithConversion: (newDirection) =>
        set((state) => {
          if (state.direction === newDirection) return state

          const inputs = {
            pricePerKwh: state.pricePerKwh,
            fixedCharge: state.fixedCharge,
            publicLightingCharge: state.publicLightingCharge,
            igvRate: state.igvRate,
            isFixedChargeEnabled: state.isFixedChargeEnabled,
            isPublicLightingEnabled: state.isPublicLightingEnabled,
            isTaxEnabled: state.isTaxEnabled,
            period: state.period,
          }

          // Sin precio la inversa no existe: cambiar de unidad con un precio
          // de 0 borraría el importe que la persona escribió.
          if (inputs.pricePerKwh <= 0) return { direction: newDirection }

          // El lado que se abandona es el ancla: el lado al que se entra se
          // deriva de él y el ancla se conserva (antes se ponía a 0), así
          // volver a cambiar devuelve el valor tal como se escribió.
          if (state.direction === 'kwh-to-money') {
            const { total } = calculateKwhToMoney(state.inputKwh, inputs)
            return { direction: newDirection, inputMoney: total }
          }

          const { kwh } = calculateMoneyToKwh(state.inputMoney, inputs)
          return { direction: newDirection, inputKwh: kwh }
        }),
      setInputKwh: (inputKwh) => set({ inputKwh }),
      setInputMoney: (inputMoney) => set({ inputMoney }),
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
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 2,
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') return initialData
        // v2 drops the language keys: language now lives in the URL, and the
        // remaining state (tariff, inputs, history) is language-independent.
        const { activeLang: _droppedLang, langResolved: _droppedResolved, ...rest } =
          persisted as Partial<LumioState> & Record<string, unknown>
        return { ...initialData, ...rest }
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
      }),
    }
  )
)
