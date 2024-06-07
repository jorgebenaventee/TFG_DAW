import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { createFormFactory } from '@tanstack/react-form'
import { Column, columnApi } from '@/api/column-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

export function useEditColumnForm({
  boardId,
  column,
}: {
  boardId: string
  column: Column
}) {
  const formFactory = createFormFactory({
    defaultValues: {
      name: column.name,
    },
  })
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: async ({
      value,
    }: {
      value: { name: string; boardId: string }
    }) => {
      await columnApi.editColumn(column.id, value)
    },
    onSuccess: async () => {
      toast({
        title: 'Columna editada',
        description: 'La columna ha sido editada con éxito',
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
          errorResponse.message ?? 'Ha ocurrido un error al editar la columna',
      })
    },
  })

  const editColumnForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({ value: { name: value.name, boardId } })
    },
  })

  return {
    editColumnForm,
  }
}
