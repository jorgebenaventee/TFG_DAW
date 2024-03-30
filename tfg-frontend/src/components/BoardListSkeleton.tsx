import { Skeleton } from '@/components/ui/skeleton.tsx'
import { boardItemClassName } from '@/constants/board.constants.ts'

export function BoardListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className={boardItemClassName} />
      ))}
    </>
  )
}
