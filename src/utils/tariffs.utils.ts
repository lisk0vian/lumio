// Pure helper functions for working with tariff data.
// No React/UI code here on purpose -- these can be unit tested in isolation
// and reused by whatever component ends up consuming them.

import type { Regulator, TariffCategory, TariffGroup, VoltageLevel } from "../types";

/**
 * Human-readable labels for each voltage level, based on IEC 60038.
 * Used for group headings in the UI (e.g. "BT5B – Low voltage").
 */
export const voltageLevelLabels: Record<VoltageLevel, string> = {
    low: "Low voltage",
    medium: "Medium voltage",
    high: "High voltage",
    "extra-high": "Extra-high voltage",
};

/**
 * Returns all tariff categories that belong to a given regulator.
 */
export function getTariffsForRegulator(
    regulatorId: string,
    categories: TariffCategory[]
): TariffCategory[] {
    return categories.filter((c) => c.regulatorId === regulatorId);
}

/**
 * Groups a flat list of tariff categories by code + voltageLevel,
 * e.g. all "BT5B" segments (residential, commercial, rural) become one group.
 */
export function groupTariffsByCode(categories: TariffCategory[]): TariffGroup[] {
    const groups = new Map<string, TariffGroup>();

    for (const category of categories) {
        const key = `${category.code}-${category.voltageLevel}`;
        const existing = groups.get(key);

        if (existing) {
            existing.items.push(category);
        } else {
            groups.set(key, {
                code: category.code,
                voltageLevel: category.voltageLevel,
                items: [category],
            });
        }
    }

    return Array.from(groups.values());
}

/**
 *   
 * @param items data for used
 * @param id 
 * @param key 
 * @returns 
 */
export function getValueById<T extends { id: string }>(
  items: T[],
  id: string | undefined,
  key: keyof T
): string | undefined {
  return items.find((item) => item.id === id)?.[key] as string | undefined;
}
