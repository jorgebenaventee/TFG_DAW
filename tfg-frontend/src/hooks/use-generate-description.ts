import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { apiFetch } from '@/utils/api-fetch.ts'

export function useGenerateDescription() {
  const { toast } = useToast()
  return useMutation({
    mutationFn: async (title: string) =>
      apiFetch(`/task/ai/description?title=${title}`),
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        title: 'Error al generar la descripción',
        description:
          errorResponse.message ??
          'Ha ocurrido un error al generar la descripción',
        variant: 'destructive',
      })
    },
  })
}
