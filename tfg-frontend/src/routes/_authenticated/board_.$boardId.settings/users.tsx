import { boardApi, User } from '@/api/board-api'
import { ColumnDef } from '@tanstack/react-table'
import { ToastAction } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { useUsersInBoard } from '@/hooks/use-users-in-board'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { DataTable } from '@/components/ui/datatable'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { AddUserBoardForm } from '@/components/AddUserBoardForm'
import { useRemoveUserBoard } from '@/hooks/use-remove-user-board'

export const Route = createFileRoute(
  '/_authenticated/board/$boardId/settings/users',
)({
  component: Users,
  loader: async ({ params: { boardId } }) => {
    const board = await boardApi.getBoard({ boardId })
    if (!board) {
      throw redirect({ to: '/' })
    }

    return board
  },
})

function Users() {
  const board = Route.useLoaderData()
  const { mutate: removeUserBoard } = useRemoveUserBoard({
    boardId: board.id,
  })
  const tableColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'username',
      header: 'Nombre de usuario',
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'lastName',
      header: 'Apellidos',
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="destructive">Eliminar</Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="font-semibold">¿Estás seguro?</p>
              <div className="mt-2 flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() =>
                    removeUserBoard({
                      boardId: board.id,
                      userId: row.original.id,
                    })
                  }
                >
                  Eliminar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )
      },
    },
  ]
  const { data, isLoading, isError, refetch } = useUsersInBoard({
    boardId: board.id,
  })

  const { toast } = useToast()

  if (isLoading) {
    return <p>Cargando...</p>
  }

  if (isError) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Ha ocurrido un error al cargar los usuarios',
      action: (
        <ToastAction altText="Reintentar" onClick={() => refetch()}>
          Reintentar
        </ToastAction>
      ),
    })
    return null
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button className="my-2 ml-auto mr-3 block">
            Añadir usuario al tablero
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <AddUserBoardForm boardId={board.id} />
        </PopoverContent>
      </Popover>
      <div className="mx-3">
        <DataTable data={data!} columns={tableColumns} />
      </div>
    </div>
  )
}
