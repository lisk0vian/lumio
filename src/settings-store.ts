import { create } from 'zustand'
import type { Regulator } from './types'
import { regulators } from './data/tariffs.data'

type State = {
    regulator?: Regulator
    tax: number,
    hasTax: boolean,
    hasRate: boolean
}

type Action = {
    setRegulator: (id: string) => void
    setTax: (tax: number) => void
}

const baseRegulator = regulators[0];

export const useSettings = create<State & Action>((set) => ({
    regulator: baseRegulator,
    hasTax: true,               // fixedCharge
    hasRate: true,              // publicLightingCharge
    tax: .18,

    setTax: (tax) => set({ tax }),
    setRegulator: (id) => {
        const regulator = regulators.find((reg) => reg.id === id);
        if (regulator) set({ regulator })
    },
}))


export const parseNumber = (num: string | number) => {
    let n: number = (typeof num === 'string') ? (parseFloat(num) || 0) : num;

    return n.toFixed(2);
}
