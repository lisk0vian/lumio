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
    <div className="grid grid-cols-4 my-3 gap-2">
      {energyLevels.map(({ key, label, range, isActive }) => (
        <EnergyBand key={key} label={label} range={range} isActive={isActive}  />
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
        'bg-accent flex flex-col items-center py-2',
        isActive && 'bg-primary text-primary-foreground'
      )}
    >
      <p className="font-bold">{label}</p>
      <p className="text-xs font-light">{range}</p>
    </div>
  )
}
