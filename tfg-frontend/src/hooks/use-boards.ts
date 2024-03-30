import { useQuery } from '@tanstack/react-query'
import { boardApi } from '@/api/board-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

export function useBoards() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.BOARDS,
    queryFn: boardApi.getBoards,
  })

  return {
    refetch,
    data,
    isLoading,
    error,
  }
}
