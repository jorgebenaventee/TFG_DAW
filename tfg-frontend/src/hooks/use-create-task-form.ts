import { createFormFactory } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'
import { taskApi } from '@/api/task-api.ts'

export function useCreateTaskForm({
  columnId,
  boardId,
}: {
  columnId: string
  boardId: string
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const formFactory = createFormFactory<{
    name: string
    description?: string
    startDate?: Date
    endDate?: Date
    assignedTo?: string[]
    tags?: string[]
    columnId: string
    boardId: string
  }>({
    defaultValues: {
      name: '',
      description: '',
      startDate: undefined,
      endDate: undefined,
      assignedTo: [],
      tags: [],
      columnId,
      boardId,
    },
  })

  const { mutate } = useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: async () => {
      toast({
        title: 'Tarea creada',
        description: 'La tarea ha sido creada con éxito',
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
  const createBoardForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate(value)
    },
  })

  return {
    createBoardForm,
  }
}
