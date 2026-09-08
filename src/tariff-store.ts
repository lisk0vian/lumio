import { create } from "zustand";
import type { BillingPeriod } from "./types";
import { useSettings } from "./settings-store";
import { regulators, tariffCategories } from "./data/tariffs.data";

export type TariffState = {
    id: string;            // unique id, e.g. "osinergmin-bt5b-residential"
    regulatorId?: string;  // FK to Regulator.id
    price: number;         // approximate reference price, user-editable
    fee: number;           // regulated base fee, charged regardless of consumption
    period: BillingPeriod;
}

export type TariffAction = {
    setPeriod: (period: BillingPeriod) => void
    setFee: (fee: number) => void
    setPrice: (price: number) => void
    setRegulator: (id: string) => void
    setTariff: (id: string) => void
}

const baseRegulator = regulators[0];
const baseTariff = tariffCategories.find((t) => t.regulatorId === baseRegulator.id);

export const useTariff = create<TariffState & TariffAction>((set) => ({
  id: baseTariff?.id ?? '',
  regulatorId: baseTariff?.regulatorId,
  period: baseTariff?.billingPeriod ?? 'monthly',
  fee: baseTariff?.fixedCharge ?? 0,
  price: baseTariff?.pricePerKwh ?? 0,

  setFee: (fee) => set({ fee }),
  setPeriod: (period) => set({ period }),
  setPrice: (price) => set({ price }),
  setRegulator: (id) => {
    const tariff = tariffCategories.find((tariff) => tariff.regulatorId === id);

    if (tariff) {
      set({
        id: tariff.id,
        regulatorId: tariff.regulatorId,
        fee: tariff.fixedCharge,
        price: tariff.pricePerKwh,
        period: tariff.billingPeriod,
      });
    }
  },
  setTariff: (id) => {
    const tariff = tariffCategories.find((tariff) => tariff.id === id);

    if (tariff) {
      set({
        id: tariff.id,
        regulatorId: tariff.regulatorId,
        fee: tariff.fixedCharge,
        price: tariff.pricePerKwh,
        period: tariff.billingPeriod,
      });
    }
  }
}));

