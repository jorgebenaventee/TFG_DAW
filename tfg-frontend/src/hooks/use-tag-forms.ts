import { useToast } from '@/components/ui/use-toast'
import { createFormFactory } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tag, tagApi } from '@/api/tag-api.ts'
import { QUERY_KEYS } from '@/constants/query.constants.ts'

const formFactory = createFormFactory<{
  id?: string
  name: string
  color: string
}>({
  defaultValues: {
    name: '',
    color: '#000000',
  },
})

export function useAddTagForm({ boardId }: { boardId: string }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: tagApi.insertTag,
    onSuccess: async () => {
      toast({
        title: 'Etiqueta añadida',
        description: 'La etiqueta se ha añadido correctamente al tablero',
      })
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.TAGS({ boardId }),
      })
    },
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        title: 'Error al añadir la etiqueta',
        description: errorResponse.message,
        variant: 'destructive',
      })
    },
  })

  const addTagForm = formFactory.useForm({
    onSubmit: ({ value }) => {
      mutate({ ...value, boardId })
    },
  })

  return { addTagForm }
}

export function useEditTagForm({
  boardId,
  tag,
}: {
  boardId: string
  tag: Tag
}) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { mutate } = useMutation({
    mutationFn: tagApi.updateTag,
    onSuccess: async () => {
      toast({
        title: 'Etiqueta actualizada',
        description: 'La etiqueta se ha actualizado correctamente',
      })
      await queryClient.refetchQueries({
        queryKey: QUERY_KEYS.TAGS({ boardId }),
      })
    },
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        title: 'Error al actualizar la etiqueta',
        description: errorResponse.message,
        variant: 'destructive',
      })
    },
  })

  const editTagForm = formFactory.useForm({
    defaultValues: {
      id: tag.id,
      name: tag.name,
      color: tag.color,
    },
    onSubmit: ({ value }) => {
      if (!tag.id) {
        return
      }
      mutate({ tagId: tag.id, tag: { ...value, boardId } })
    },
  })

  return { editTagForm }
}
