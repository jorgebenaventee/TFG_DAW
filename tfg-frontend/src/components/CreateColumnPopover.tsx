import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CreateColumnForm } from '@/components/CreateColumnForm.tsx'
import { useState } from 'react'

export function CreateColumnPopover({ boardId }: { boardId: string }) {
  const [formOpen, setFormOpen] = useState(false)
  return (
    <Popover open={formOpen} onOpenChange={setFormOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="flex gap-2">
          Añadir columna
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <CreateColumnForm
          boardId={boardId}
          onSubmit={() => setFormOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
