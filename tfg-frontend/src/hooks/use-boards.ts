import { useQuery } from '@tanstack/react-query'
import { boardApi } from '@/api/board-api.ts'

export function useBoards() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['boards'],
    queryFn: boardApi.getBoards,
  })

  return {
    refetch,
    data,
    isLoading,
    error,
  }
}
