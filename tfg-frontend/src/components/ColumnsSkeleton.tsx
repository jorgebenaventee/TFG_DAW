import { Skeleton } from '@/components/ui/skeleton.tsx'
import { columnItemClassName } from '@/constants/board.constants.ts'

export function ColumnsSkeleton() {
  const length = 6
  return (
    <>
      {Array.from({ length }).map((_, index) => (
        <Skeleton className={columnItemClassName} key={index} />
      ))}
    </>
  )
}
