import { Column } from '@/api/column-api'
import { DotsIcon } from './icons/dots-icon'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { EditColumnForm } from './EditColumnForm'
import { useState } from 'react'

export function EditColumnButton({ column }: { column: Column }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <DotsIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="cursor-pointer">
          <DropdownMenuItem>
            <DialogTrigger asChild>
              <Button variant="ghost">Editar</Button>
            </DialogTrigger>
          </DropdownMenuItem>
        </DropdownMenuContent>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar columna</DialogTitle>
          </DialogHeader>
          <EditColumnForm column={column} onSubmit={() => setOpen(false)} />
        </DialogContent>
      </DropdownMenu>
    </Dialog>
  )
}
