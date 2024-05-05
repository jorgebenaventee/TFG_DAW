import { boardApi } from '@/api/board-api'
import { QUERY_KEYS } from '@/constants/query.constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRemoveUserBoard({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: boardApi.removeUserFromBoard,
    onSuccess: () => {
      queryClient.refetchQueries({
        queryKey: QUERY_KEYS.USER_BOARD({ boardId }),
      })
    },
  })
}
