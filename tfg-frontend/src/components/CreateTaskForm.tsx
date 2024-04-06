import { useCreateTaskForm } from '@/hooks/use-create-task-form.ts'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createTaskSchema } from '@/api/task-api.ts'
import { Label } from '@/components/ui/label.tsx'
import { InputErrors } from '@/components/InputErrors.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar.tsx'
import { cn, formatDate } from '@/lib/utils.ts'
import { Textarea } from '@/components/ui/textarea.tsx'

export function CreateTaskForm({
  boardId,
  columnId,
}: {
  boardId: string
  columnId: string
}) {
  const { createBoardForm } = useCreateTaskForm({ boardId, columnId })
  const { name, startDate, endDate, description, assignedTo, tags } =
    createTaskSchema.shape
  return (
    <createBoardForm.Provider>
      <form
        className="grid w-full grid-cols-4 gap-4"
        id="create-board-form"
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await createBoardForm.handleSubmit()
        }}
      >
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          name="name"
          validators={{
            onSubmit: name,
          }}
        >
          {(field) => (
            <Label className="col-span-4 flex flex-col gap-2">
              Nombre de la tarea
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          name="startDate"
          validators={{ onSubmit: startDate }}
        >
          {(field) => (
            <Label className="flex flex-col gap-2">
              Fecha de inicio
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !field.getValue() && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.getValue() ? (
                      formatDate(field.getValue()!)
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.getValue()}
                    onSelect={(date) => field.handleChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          name="endDate"
          validators={{ onSubmit: endDate }}
        >
          {(field) => (
            <Label className="flex flex-col gap-2">
              Fecha de fin
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !field.getValue() && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.getValue() ? (
                      formatDate(field.getValue()!)
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.getValue()}
                    onSelect={(date) => field.handleChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          name="assignedTo"
          validators={{ onSubmit: assignedTo }}
        >
          {(field) => (
            <Label className="flex flex-col gap-2">
              Asignado a{/* <MultipleSelector */}
              {/*  value={field.state.value} */}
              {/*  onChange={(value) => field.handleChange(value)} */}
              {/* /> */}
              <Input value={field.state.value} />
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          name="tags"
          validators={{ onSubmit: tags }}
        >
          {(field) => (
            <Label className="flex flex-col gap-2">
              Etiquetas{/* <MultipleSelector */}
              {/*  value={field.state.value} */}
              {/*  onChange={(value) => field.handleChange(value)} */}
              {/* /> */}
              <Input value={field.state.value} />
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
        <createBoardForm.Field
          validatorAdapter={zodValidator}
          validators={{ onSubmit: description }}
          name="description"
        >
          {(field) => (
            <Label className="col-span-4 flex flex-col gap-2">
              Descripción
              <Textarea
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <InputErrors field={field} />
            </Label>
          )}
        </createBoardForm.Field>
      </form>
      <Button form="create-board-form" className="w-fit min-w-36">
        Crear tarea
      </Button>
    </createBoardForm.Provider>
  )
}
