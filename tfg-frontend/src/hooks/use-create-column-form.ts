import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { createFormFactory } from '@tanstack/react-form'
import { columnApi } from '@/api/column-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

const formFactory = createFormFactory({
  defaultValues: {
    name: '',
  },
})

export function useCreateColumnForm({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: columnApi.createColumn,
    onSuccess: async () => {
      toast({
        title: 'Columna creada',
        description: 'La columna ha sido creada con éxito',
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
        description:
          errorResponse.message ?? 'Ha ocurrido un error al crear la columna',
      })
    },
  })

  const createColumnForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({ ...value, boardId })
    },
  })

  return {
    createColumnForm,
  }
}
