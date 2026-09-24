import { beforeEach, describe, expect, it } from 'vitest'
import { HISTORY_LIMIT } from '../types'
import { tariffCategories } from '../data/tariffs.data'
import { migratePersistedState, useLumioStore } from './lumio-store'

function state() {
  return useLumioStore.getState()
}

beforeEach(() => {
  state().resetAll()
  state().clearRecords()
})

describe('setDirectionWithConversion', () => {
  it('convierte el ancla al cambiar de unidad y la conserva al volver', () => {
    state().setPricePerKwh(0.7)
    state().setInputKwh(22)
    state().setDirectionWithConversion('money-to-kwh')
    const after = state()
    expect(after.direction).toBe('money-to-kwh')
    expect(after.inputMoney).toBeGreaterThan(0)
    expect(after.inputKwh).toBe(22)

    state().setDirectionWithConversion('kwh-to-money')
    expect(state().inputKwh).toBeCloseTo(22, 9)
  })

  it('sin precio solo cambia la dirección sin borrar el importe', () => {
    state().setPricePerKwh(0)
    state().setInputKwh(22)
    state().setDirectionWithConversion('money-to-kwh')
    expect(state().direction).toBe('money-to-kwh')
    expect(state().inputMoney).toBe(0)
  })

  it('es no-op con la misma dirección', () => {
    state().setInputKwh(22)
    state().setDirectionWithConversion('kwh-to-money')
    expect(state().inputKwh).toBe(22)
  })
})

describe('records', () => {
  function addSample(i: number) {
    state().addRecord({
      direction: 'kwh-to-money',
      inputKwh: i,
      inputMoney: null,
      resultKwh: i,
      resultMoney: i,
    })
  }

  it('recorta el historial al límite conservando los más recientes', () => {
    for (let i = 1; i <= HISTORY_LIMIT + 5; i++) addSample(i)
    const { records } = state()
    expect(records).toHaveLength(HISTORY_LIMIT)
    expect(records[0]?.inputKwh).toBe(6)
    expect(records.at(-1)?.inputKwh).toBe(HISTORY_LIMIT + 5)
  })

  it('removeRecord y clearRecords vacían lo esperado', () => {
    addSample(1)
    addSample(2)
    const [first] = state().records
    state().removeRecord(first?.id ?? '')
    expect(state().records).toHaveLength(1)
    state().clearRecords()
    expect(state().records).toHaveLength(0)
  })

  it('resetAll conserva el historial pero restaura los ajustes', () => {
    addSample(1)
    state().setPricePerKwh(9.99)
    state().resetAll()
    const after = state()
    expect(after.records).toHaveLength(1)
    expect(after.pricePerKwh).not.toBe(9.99)
  })
})

describe('setTariff', () => {
  it('aplica la ficha del catálogo y ignora ids desconocidos', () => {
    const target = tariffCategories[1] ?? tariffCategories[0]
    state().setTariff(target.id)
    expect(state().tariffId).toBe(target.id)
    expect(state().pricePerKwh).toBe(target.pricePerKwh)

    state().setTariff('does-not-exist')
    expect(state().tariffId).toBe(target.id)
  })
})

describe('migratePersistedState', () => {
  it('suelta las claves de idioma y conserva el resto', () => {
    const migrated = migratePersistedState({
      activeLang: 'en',
      langResolved: true,
      inputKwh: 22,
    })
    expect(migrated).not.toHaveProperty('activeLang')
    expect(migrated).not.toHaveProperty('langResolved')
    expect(migrated.inputKwh).toBe(22)
  })

  it('devuelve el estado inicial con persistencia inválida', () => {
    expect(migratePersistedState(null).inputKwh).toBe(0)
    expect(migratePersistedState(undefined).records).toEqual([])
  })
})
