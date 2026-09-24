import { useLumioStore } from '@/stores/lumio-store'
import type { SettingFieldId } from '@/utils/animated-number.utils'

// Reads the enable-toggle paired with a settings numeric field (desktop
// InputSetting, mobile UnderlineInput). Fields without a toggle (price)
// are always enabled.
export function useChargeEnabled(field: SettingFieldId | undefined): boolean {
  const fixedOn = useLumioStore((state) => state.isFixedChargeEnabled)
  const lightingOn = useLumioStore((state) => state.isPublicLightingEnabled)
  const taxOn = useLumioStore((state) => state.isTaxEnabled)
  if (field === 'fixed') return fixedOn
  if (field === 'lighting') return lightingOn
  if (field === 'tax') return taxOn
  return true
}
