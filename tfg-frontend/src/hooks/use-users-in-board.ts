import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query.constants.ts'
import { boardApi } from '@/api/board-api.ts'

export function useUsersInBoard({ boardId }: { boardId: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.USER_BOARD({ boardId }),
    queryFn: () => boardApi.getUsersInBoard(boardId),
  })
}
