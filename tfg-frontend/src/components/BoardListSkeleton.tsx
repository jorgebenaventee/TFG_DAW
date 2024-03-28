import { Skeleton } from '@/components/ui/skeleton.tsx'
import { className } from '@/constants/board.constants.ts'

export function BoardListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className={className} />
      ))}
    </>
  )
}
