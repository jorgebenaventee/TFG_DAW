import { Column } from '@/api/column-api'
import { useEditColumnForm } from '@/hooks/use-edit-column-form'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { InputErrors } from './InputErrors'
import { Button } from './ui/button'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'

export function EditColumnForm({
  column,
  onSubmit,
}: {
  column: Column
  onSubmit?: () => void
}) {
  const { editColumnForm } = useEditColumnForm({
    column,
    boardId: column.boardId,
  })

  return (
    <>
      <editColumnForm.Provider>
        <form
          className="flex w-full flex-col justify-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await editColumnForm.handleSubmit()
            if (editColumnForm.state.isValid) {
              onSubmit?.()
            }
          }}
        >
          <editColumnForm.Field
            validatorAdapter={zodValidator}
            name="name"
            validators={{
              onSubmit: z
                .string()
                .min(
                  3,
                  'El nombre de la columna debe tener al menos 3 caracteres',
                ),
            }}
          >
            {(field) => (
              <Label className="flex flex-col gap-2">
                Nombre de la columna
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <InputErrors field={field} />
              </Label>
            )}
          </editColumnForm.Field>
          <Button variant="ghost">Crear</Button>
        </form>
      </editColumnForm.Provider>
    </>
  )
}
