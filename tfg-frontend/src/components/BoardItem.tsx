import { Board, boardApi } from '@/api/board-api.ts'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast.ts'
import { apiFetch } from '@/utils/api-fetch.ts'
import { useState } from 'react'
import { className } from '@/constants/board.constants.ts'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog.tsx'
import { Button } from '@/components/ui/button.tsx'
import { TrashIcon } from '@/components/icons/trash-icon.tsx'

export function BoardItem({ board }: { board: Board }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { mutate } = useMutation({
    mutationFn: (boardId: string) =>
      apiFetch(`/board/${boardId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      toast({
        title: 'Tablero eliminado',
        description: 'El tablero ha sido eliminado con éxito',
      })
      await queryClient.refetchQueries({ queryKey: ['boards'] })
    },
    onError: (error) => {
      const errorResponse = JSON.parse(error.message)
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          errorResponse.message ?? 'Ha ocurrido un error al borrar el tablero',
      })
    },
  })
  const [image, setImage] = useState<Blob | null>(null)
  useQuery({
    queryKey: ['board-image', board.id],
    queryFn: () =>
      boardApi.getBoardImage(board).then((blob) => {
        setImage(blob)
        return blob
      }),
    enabled: !!board.image,
  })
  return (
    <div
      className={`group relative ${className} cursor-pointer rounded bg-accent transition hover:scale-105`}
    >
      {image && (
        <img
          src={URL.createObjectURL(image)}
          alt={board.name}
          className="h-full w-full rounded object-cover"
        />
      )}
      <div className="absolute top-0 flex h-full w-full items-end rounded bg-secondary/75 px-2 py-3">
        <h3 className="text-lg font-semibold">{board.name}</h3>
      </div>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            className="absolute right-2 top-2 hidden text-red-500 group-hover:block"
            variant="destructive"
          >
            <TrashIcon className="text-white" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle asChild>
              <h2 className="text-balance font-semibold">
                ¿Estás seguro que quieres eliminar el tablero {board.name}?
              </h2>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="font-semibold text-red-500">
                Esta acción no se puede deshacer
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => mutate(board.id)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
