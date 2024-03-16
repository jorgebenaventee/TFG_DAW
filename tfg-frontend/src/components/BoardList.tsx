import { Skeleton } from '@/components/ui/skeleton.tsx'
import { useBoards } from '@/hooks/use-boards.ts'
import { Board } from '@/api/board-api.ts'
import { useEffect, useRef, useState } from 'react'
import { PlusIcon } from '@/components/icons/plus-icon.tsx'
import { useCreateBoardForm } from '@/hooks/use-create-board-form.ts'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'
import { TrashIcon } from '@/components/icons/trash-icon.tsx'
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
} from './ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/utils/api-fetch.ts'
import { useToast } from '@/components/ui/use-toast.ts'

export function BoardList() {
  const { data = [], isLoading } = useBoards()
  return (
    <>
      <h3 className="text-2xl font-semibold">Tus tableros</h3>
      <div className="mt-3 grid grid-cols-2 gap-8 md:grid-cols-3 xl:grid-cols-6">
        {isLoading ? (
          <BoardListSkeleton />
        ) : (
          <>
            {data.map((board) => (
              <BoardItem key={board.id} board={board} />
            ))}
            <CreateBoardItem />
          </>
        )}
      </div>
    </>
  )
}

function BoardListSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-36 w-full" />
      ))}
    </>
  )
}

function CreateBoardItem() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { createBoardForm } = useCreateBoardForm()
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowCreateForm(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
  return (
    <div
      ref={ref}
      className="relative h-36 w-full cursor-pointer rounded bg-accent transition hover:scale-105"
      onClick={() => setShowCreateForm(true)}
    >
      {!showCreateForm && (
        <PlusIcon className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 transform text-accent-foreground" />
      )}{' '}
      <div className="absolute top-0 flex h-full w-full items-end rounded bg-secondary/75 px-2 py-3">
        {showCreateForm ? (
          <createBoardForm.Provider>
            <form
              className="flex w-full flex-col justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void createBoardForm.handleSubmit()
              }}
            >
              <createBoardForm.Field
                validatorAdapter={zodValidator}
                name="name"
                validators={{
                  onSubmit: z
                    .string()
                    .min(1, 'El nombre del tablero es requerido'),
                }}
              >
                {(field) => (
                  <Label className="flex flex-col gap-2">
                    Nombre del tablero
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em className="text-red-500" role="alert">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </Label>
                )}
              </createBoardForm.Field>
              <Button>Crear</Button>
            </form>
          </createBoardForm.Provider>
        ) : (
          <h3 className="text-lg font-semibold">Crear tablero</h3>
        )}
      </div>
    </div>
  )
}

function BoardItem({ board }: { board: Board }) {
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
  return (
    <div className="group relative h-36 w-full cursor-pointer rounded bg-accent transition hover:scale-105">
      {board.image && (
        <img
          src="https://placehold.co/600x400"
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
