import { boardApi } from '@/api/board-api'
import { QUERY_KEYS } from '@/constants/query.constants'
import { useQuery } from '@tanstack/react-query'

export function useBoard({ boardId }: { boardId: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.BOARD({ boardId }),
    queryFn: () => {
      if (!boardId) {
        return {
          isAdmin: false,
        }
      }
      return boardApi.getBoard({ boardId })
    },
  })
}
