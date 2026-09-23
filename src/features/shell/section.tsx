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
      <p className="mb-2 text-[0.625rem] font-medium tracking-[0.16em] text-muted-foreground uppercase 2xl:text-xs">
        {title}
      </p>
      {children}
    </div>
  )
}
