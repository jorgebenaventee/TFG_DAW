import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query.constants.ts'
import { tagApi } from '@/api/tag-api.ts'

export function useTagsInBoard({ boardId }: { boardId: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.TAGS({ boardId }),
    queryFn: () => tagApi.getTags({ boardId }),
  })
}
