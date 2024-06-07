import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { columnApi } from '@/api/column-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

export function useDeleteColumn(columnId: string, boardId: string) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  return useMutation({
    mutationFn: async () => columnApi.deleteColumn(columnId),
    onSuccess: async () => {
      toast({
        title: 'Columna eliminada',
        description: 'La columna ha sido eliminada con éxito',
      })
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.COLUMNS({ boardId }),
      })
    },
    onError: (error) => {
      toast({
        title: 'Error al eliminar la columna',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
