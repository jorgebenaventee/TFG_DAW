import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query.constants.ts'
import { columnApi } from '@/api/column-api.ts'
import { useToast } from '@/components/ui/use-toast.ts'
import { taskApi } from '@/api/task-api.ts'

export function useColumns({ boardId }: { boardId: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.COLUMNS({ boardId }),
    queryFn: () => columnApi.getColumns({ boardId }),
  })
}

export function useMoveTask({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: taskApi.moveTask,
    onSuccess: async () => {
      toast({
        title: 'Tarea movida',
        description: 'La tarea ha sido movida con éxito',
      })
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.COLUMNS({ boardId }),
      })
    },
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorResponse.message,
      })
    },
  })
}
