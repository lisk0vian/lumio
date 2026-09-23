import type { FC } from 'react'
import { SettingOptions } from './setting-options'
import { useEnterAnimation } from '@/hooks/use-enter-animation'
import type { AppLang } from '@/i18n'

// Desktop settings footer: thin island wrapper so the hydration root is
// visible by filename convention (*.island.tsx). The controls themselves
// stay shared leaves, reused by the mobile settings panel.
export const SettingsBar: FC<{ lang: AppLang }> = ({ lang }) => {
  const enterRef = useEnterAnimation<HTMLDivElement>()

  return (
    <div ref={enterRef}>
      <SettingOptions lang={lang} />
    </div>
  )
}
