import { QUERY_KEYS } from '@/constants/query.constants'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagApi } from '@/api/tag-api.ts'

export function useRemoveTag({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tagId }: { tagId: string }) => tagApi.deleteTag({ tagId }),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.TAGS({ boardId }),
      })
    },
  })
}
