import { cn } from '@/lib/utils'

const energyLevels: (EnergyBandProps & { key: string })[] = [
  {
    key: 'low',
    label: 'Bajo',
    range: '< 70',
  },
  {
    key: 'normal',
    label: 'Normal',
    range: '70-140',
  },
  {
    key: 'high',
    label: 'Alto',
    range: '140-250',
  },
  {
    key: 'extra-high',
    label: 'Muy alto',
    range: '> 250',
  },
]
export const EnergyScale = () => {
  return (
    <div className="my-3 flex gap-0.5">
      {energyLevels.map(({ key, label, range, isActive }) => (
        <EnergyBand key={key} label={label} range={range} isActive={isActive} />
      ))}
    </div>
  )
}

type EnergyBandProps = {
  label: string
  range: string
  isActive?: boolean
}

const EnergyBand = ({ label, range, isActive }: EnergyBandProps) => {
  return (
    <div
      className={cn(
        'flex-1 px-1 py-2.5 text-center',
        isActive ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
      )}
    >
      <p className="text-xs leading-snug font-medium whitespace-nowrap">{label}</p>
      <p className="mt-0.5 text-[0.625rem] whitespace-nowrap opacity-65">{range}</p>
    </div>
  )
}
