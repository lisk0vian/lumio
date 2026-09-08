import { cn } from '@/lib/utils'

type SectionProps = {
  title: string
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

export const SectionBlock = ({
  title,
  className,
  children,
  ...props
}: SectionProps) => {
  return (
    <div {...props} className={cn('w-full', className)}>
      <p className="text-xs font-semibold mb-2 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}
