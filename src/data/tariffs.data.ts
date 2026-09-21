// Static reference data for the energy tariff selector.
// Prices are approximate and meant to be edited by the user over time --
// they are NOT fetched from a live API and will drift from OSINERGMIN's
// actual published pliegos tarifarios.
//
// To update: check https://www.osinergmin.gob.pe for the current pliego
// tarifario of the relevant electrical system (e.g. Lima Norte, Lima Sur).

import type { Regulator, TariffCategory } from "../types";

export const regulators: Regulator[] = [
  {
    id: "osinergmin",
    name: "OSINERGMIN",
    countryCode: "PE",
  },
];

export const tariffCategories: TariffCategory[] = [
  {
    id: "osinergmin-bt5b-residential",
    regulatorId: "osinergmin",
    code: "BT5B",
    voltageLevel: "low",
    segment: "residential",
    label: "Residencial",
    billingPeriod: 'monthly',
    fixedCharge: 2.34,
    // Verified from a real June 2026 electricity bill, Lima Norte system.
    pricePerKwh: 0.6144,
    publicLightingCharge: 0.1,
    verified: true,
  },
  {
    id: "osinergmin-bt5b-commercial",
    regulatorId: "osinergmin",
    code: "BT5B",
    voltageLevel: "low",
    segment: "commercial",
    label: "Comercial",
    billingPeriod: 'monthly',
    fixedCharge: 3.64,
    publicLightingCharge: 0.1,
    // Rough estimate -- not confirmed against an official pliego. Edit when known.
    pricePerKwh: 0.70,
    verified: false,
  },
  {
    id: "osinergmin-bt5b-rural",
    regulatorId: "osinergmin",
    code: "BT5B",
    voltageLevel: "low",
    segment: "rural",
    label: "Rural",
    billingPeriod: 'monthly',
    fixedCharge: 0,
    publicLightingCharge: 0.1,
    // Rough estimate -- not confirmed against an official pliego. Edit when known.
    pricePerKwh: 0.58,
    verified: false,
  },
  {
    id: "osinergmin-bt6-residential",
    regulatorId: "osinergmin",
    code: "BT6",
    voltageLevel: "low",
    segment: "residential",
    label: "Residencial",
    billingPeriod: 'monthly',
    fixedCharge: 0,
    publicLightingCharge: 0.1,
    // Rough estimate -- not confirmed against an official pliego. Edit when known.
    pricePerKwh: 0.60,
    verified: false,
  },
  {
    id: "osinergmin-mt1-industrial",
    regulatorId: "osinergmin",
    code: "MT1",
    voltageLevel: "medium",
    segment: "industrial",
    label: "Industrial",
    billingPeriod: 'monthly',
    fixedCharge: 0,
    publicLightingCharge: 0.1,
    // Rough estimate -- not confirmed against an official pliego. Edit when known.
    pricePerKwh: 0.45,
    verified: false,
  },
];