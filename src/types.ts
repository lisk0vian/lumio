export const MONEY = 'S/';

export type Receipt = {
  label: string,
  money: number
}

// types.ts
// Core data model for the energy tariff selector.
// Structure: Regulator -> TariffCategory (grouped by code + voltageLevel in the UI).
// No Distributor entity is modeled here on purpose: prices are approximate
// and user-editable, so per-company pricing is out of scope for this app.

/**
 * Voltage levels are based on the IEC 60038 international standard.
 * This is the one part of the model that is genuinely reusable across countries,
 * since it comes from physics, not from a specific regulator's naming scheme.
 */
export type VoltageLevel = "low" | "medium" | "high" | "extra-high";

/**
 * Voltage levels are based on the IEC 60038 international standard.
 * This is the one part of the model that is genuinely reusable across countries,
 * since it comes from physics, not from a specific regulator's naming scheme.
 */
export type BillingPeriod = "monthly" | "bimonthly";

/**
 * Usage segment for a tariff category.
 * Extend this union as needed (e.g. "seasonal", "prepaid") if the data requires it.
 */
export type Segment = "residential" | "commercial" | "industrial" | "rural";

/**
 * A national/regional regulatory body that defines its own tariff codes.
 * Example: OSINERGMIN in Peru. Each regulator is scoped to one country.
 */
export interface Regulator {
  id: string;          // e.g. "osinergmin"
  name: string;         // e.g. "OSINERGMIN"
  countryCode: string;  // ISO-ish country code, e.g. "PE"
}

/**
 * A tariff category as defined by a regulator.
 * `code` is the regulator's own naming (e.g. "BT5B") and is NOT reused
 * across countries -- it only has meaning within its `regulatorId`.
 * `voltageLevel` links the category to the universal IEC classification.
 */
export interface TariffCategory {
  id: string;                   // unique id, e.g. "osinergmin-bt5b-residential"
  regulatorId: string;          // FK to Regulator.id
  code: string;                 // regulator-specific code, e.g. "BT5B"
  voltageLevel: VoltageLevel;
  segment: Segment;
  label: string;                // human-readable segment label, e.g. "Residential"
  pricePerKwh: number;          // approximate reference price, user-editable
  fixedCharge: number;          // regulated base fee, charged regardless of consumption
  publicLightingCharge: number; // municipal fee for public lighting, varies by district
  verified: boolean;            // true if this price was confirmed against a real source
  billingPeriod: BillingPeriod;
}

/**
 * Grouping helper type: used by the UI to cluster TariffCategory entries
 * that share the same code + voltageLevel (e.g. all "BT5B" segments together).
 */
export interface TariffGroup {
  code: string;
  voltageLevel: VoltageLevel;
  items: TariffCategory[];
}
