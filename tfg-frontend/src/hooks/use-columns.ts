import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query.constants.ts'
import { columnApi } from '@/api/column-api.ts'

export function useColumns({ boardId }: { boardId: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.COLUMNS({ boardId }),
    queryFn: () => columnApi.getColumns({ boardId }),
  })
}
