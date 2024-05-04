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

export function EditColumnButton({ column }: { column: Column }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <DotsIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="cursor-pointer">
        <DropdownMenuItem>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost">Editar</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar columna</DialogTitle>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
