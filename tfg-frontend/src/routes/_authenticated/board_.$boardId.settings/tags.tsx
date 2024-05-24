import { createFileRoute, redirect } from '@tanstack/react-router'
import { boardApi } from '@/api/board-api.ts'
import { Tag } from '@/api/tag-api.ts'
import { ColumnDef } from '@tanstack/react-table'
import { useTagsInBoard } from '@/hooks/useTagsInBoard.ts'
import { useToast } from '@/components/ui/use-toast.ts'
import { ToastAction } from '@/components/ui/toast.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button.tsx'
import { DataTable } from '@/components/ui/datatable.tsx'
import { AddTagForm } from '@/components/AddTagForm.tsx'
import { EditTagForm } from '@/components/EditTagForm.tsx'
import { useRemoveTag } from '@/hooks/use-remove-tag.ts'

export const Route = createFileRoute(
  '/_authenticated/board/$boardId/settings/tags',
)({
  component: Tags,
  loader: async ({ params: { boardId } }) => {
    const board = await boardApi.getBoard({ boardId })
    if (!board) {
      throw redirect({ to: '/' })
    }

    return board
  },
})

function Tags() {
  const board = Route.useLoaderData()
  const { mutate: removeTag } = useRemoveTag({ boardId: board.id })
  const tableColumns: ColumnDef<Tag>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: ({ row }) => {
        return (
          <div
            className="h-6 w-6 rounded-full"
            style={{ backgroundColor: row.original.color }}
          />
        )
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      accessorFn: (row) => row,
      cell: ({ row }) => {
        return (
          <div className="flex w-fit content-start items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="my-2 ml-auto mr-3 block">Editar</Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <EditTagForm boardId={board.id} tag={row.original} />
              </PopoverContent>
            </Popover>
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
                      removeTag({
                        tagId: row.original.id!,
                      })
                    }
                  >
                    Eliminar
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )
      },
    },
  ]

  const { data, isLoading, isError, refetch } = useTagsInBoard({
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
      description: 'Ha ocurrido un error al cargar las etiquetas',
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
            Añadir etiqueta al tablero
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <AddTagForm boardId={board.id} />
        </PopoverContent>
      </Popover>
      <div className="mx-3">
        <DataTable
          data={data!}
          columns={tableColumns as ColumnDef<unknown>[]}
        />
      </div>
    </div>
  )
}
