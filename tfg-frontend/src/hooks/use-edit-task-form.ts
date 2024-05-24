import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { createFormFactory } from '@tanstack/react-form'
import { EditTask, Task, taskApi } from '@/api/task-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

export function useEditTaskForm({
  task,
  boardId,
}: {
  task: Task
  boardId: string
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const formFactory = createFormFactory<EditTask>({
    defaultValues: {
      ...task,
      tags: task.tags?.map((tag) => tag.id!) ?? [],
      boardId,
    },
  })

  const { mutate } = useMutation({
    mutationFn: taskApi.updateTask,
    onSuccess: async () => {
      toast({
        title: 'Tarea creada',
        description: 'La tarea ha sido editada con éxito',
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
  const editTaskForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({
        newTask: { ...value, boardId },
        taskId: task.id,
      })
    },
  })

  return {
    editTaskForm,
  }
}
