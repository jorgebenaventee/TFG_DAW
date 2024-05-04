import { createTaskSchema, EditTask } from '@/api/task-api.ts'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { InputErrors } from '@/components/InputErrors.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import { Button } from '@/components/ui/button.tsx'
import { cn, formatDate } from '@/lib/utils.ts'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar.tsx'
import { Textarea } from '@/components/ui/textarea.tsx'
import { useEditTaskForm } from '@/hooks/use-edit-task-form.tsx'
import { useUsersInBoard } from '@/hooks/use-users-in-board.ts'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector.tsx'

export function EditTaskForm({
  boardId,
  task,
}: {
  boardId: string
  task: EditTask
}) {
  const { editTaskForm } = useEditTaskForm({ boardId, task })
  const { data: users = [], isLoading: usersLoading } = useUsersInBoard({
    boardId,
  })
  const { name, startDate, endDate, description, assignedTo, tags } =
    createTaskSchema.shape
  const userOptions: Option[] =
    users?.map((user) => ({
      label: user.username,
      value: user.id,
    })) ?? []
  return (
    <editTaskForm.Provider>
      <form
        className="grid w-full grid-cols-4 gap-4"
        id="create-board-form"
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await editTaskForm.handleSubmit()
        }}
      >
        <editTaskForm.Field
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
        </editTaskForm.Field>
        <editTaskForm.Field
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
                    selected={field.getValue() ?? undefined}
                    onSelect={(date) => field.handleChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <InputErrors field={field} />
            </Label>
          )}
        </editTaskForm.Field>
        <editTaskForm.Field
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
                    selected={field.getValue() ?? undefined}
                    onSelect={(date) => field.handleChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <InputErrors field={field} />
            </Label>
          )}
        </editTaskForm.Field>
        <editTaskForm.Field
          validatorAdapter={zodValidator}
          name="assignedTo"
          validators={{ onSubmit: assignedTo }}
        >
          {(field) => (
            <Label className="flex flex-col gap-2">
              Asignado a
              <MultipleSelector
                options={userOptions}
                disabled={usersLoading}
                value={field.state.value?.map((s) => ({
                  value: s,
                  label: users!.find((u) => u.id === s)?.username ?? '',
                }))}
                onChange={(value) =>
                  field.handleChange(value.map((o) => o.value))
                }
              />
              <InputErrors field={field} />
            </Label>
          )}
        </editTaskForm.Field>
        <editTaskForm.Field
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
        </editTaskForm.Field>
        <editTaskForm.Field
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
        </editTaskForm.Field>
      </form>
      <Button form="create-board-form" className="w-fit min-w-36">
        Editar tarea
      </Button>
    </editTaskForm.Provider>
  )
}