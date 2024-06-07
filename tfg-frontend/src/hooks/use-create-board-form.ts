import { createFormFactory } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { boardApi } from '@/api/board-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

const formFactory = createFormFactory<{ name: string; image?: File }>({
  defaultValues: {
    name: '',
    image: undefined,
  },
})

export function useCreateBoardForm() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: boardApi.createBoard,
    onSuccess: async () => {
      toast({
        title: 'Tablero creado',
        description: 'El tablero ha sido creado con éxito',
      })
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.BOARDS })
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
  const createBoardForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({ ...value, isAdmin: false })
    },
  })

  return {
    createBoardForm,
  }
}
