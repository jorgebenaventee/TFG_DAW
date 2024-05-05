import { boardApi } from '@/api/board-api'
import { useToast } from '@/components/ui/use-toast'
import { QUERY_KEYS } from '@/constants/query.constants'
import { createFormFactory } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const formFactory = createFormFactory({
  defaultValues: {
    username: '',
    role: 'USER',
  },
})

export function useAddUserBoardForm({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: boardApi.addUserToBoard,
    onSuccess: async () => {
      toast({
        title: 'Usuario añadido',
        description: 'El usuario se ha añadido correctamente al tablero',
      })
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.USER_BOARD({ boardId }),
      })
    },
  })
  const addUserToBoardForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({ ...value, boardId })
    },
  })

  return { addUserToBoardForm }
}
