import type { FC } from 'react'
import { SettingOptions } from './setting-options'
import { useHydrated } from '@/stores/use-hydrated'
import type { AppLang } from '@/i18n'

// Desktop settings footer: thin island wrapper so the hydration root is
// visible by filename convention (*.island.tsx). The controls themselves
// stay shared leaves, reused by the mobile settings panel.
export const SettingsBar: FC<{ lang: AppLang }> = ({ lang }) => {
  const hydrated = useHydrated()

  if (!hydrated) return null

  return <SettingOptions lang={lang} />
}
