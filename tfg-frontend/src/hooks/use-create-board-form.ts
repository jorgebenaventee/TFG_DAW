import { createFormFactory } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { Board, boardSchema } from '@/api/board-api.ts'
import { apiFetch } from '@/utils/api-fetch.ts'

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
    mutationFn: (data: Omit<Board, 'id'>) => {
      const formData = new FormData()
      formData.append('name', data.name)
      if (data.image != null) {
        formData.append('image', data.image)
      }
      return apiFetch(
        '/board',
        {
          body: formData,
          method: 'POST',
          headers: {},
        },
        boardSchema,
      )
    },
    onSuccess: async () => {
      toast({
        title: 'Tablero creado',
        description: 'El tablero ha sido creado con éxito',
      })
      await queryClient.refetchQueries({ queryKey: ['boards'] })
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
      mutate(value)
    },
  })

  return {
    createBoardForm,
  }
}
