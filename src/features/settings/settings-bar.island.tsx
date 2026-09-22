import type { FC } from 'react'
import { SettingOptions } from './setting-options'
import { Skeleton } from '@/components/ui/skeleton'
import { useHydrated } from '@/stores/use-hydrated'
import type { AppLang } from '@/i18n'

// Desktop settings footer: thin island wrapper so the hydration root is
// visible by filename convention (*.island.tsx). The controls themselves
// stay shared leaves, reused by the mobile settings panel.
export const SettingsBar: FC<{ lang: AppLang }> = ({ lang }) => {
  const hydrated = useHydrated()

  if (!hydrated)
    return (
      <div aria-hidden="true" className="flex w-full gap-3 pt-7 pb-2">
        <Skeleton className="h-7 flex-1" />
        <Skeleton className="h-7 flex-1" />
        <Skeleton className="h-7 w-28" />
      </div>
    )

  return <SettingOptions lang={lang} />
}
