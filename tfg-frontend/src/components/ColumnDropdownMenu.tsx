import { Column } from '@/api/column-api'
import { DotsIcon } from './icons/dots-icon'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { EditColumnForm } from './EditColumnForm'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog.tsx'
import { useDeleteColumn } from '@/hooks/use-delete-column.ts'
import { useBoard } from '@/hooks/use-board.ts'

export function ColumnDropdownMenu({ column }: { column: Column }) {
  const { data: board } = useBoard({ boardId: column.boardId })
  const [open, setOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const { mutate } = useDeleteColumn(column.id, column.boardId)
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <DotsIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="cursor-pointer">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Editar
          </DropdownMenuItem>
          {board?.isAdmin && (
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => setAlertOpen(true)}
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar columna</DialogTitle>
          </DialogHeader>
          <EditColumnForm column={column} onSubmit={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle asChild>
              <h2 className="text-balance font-semibold">Hola :)</h2>
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
              data-delete-button
              onClick={() => mutate()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
