import { useCreateColumnForm } from '@/hooks/use-create-column-form.ts'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { InputErrors } from '@/components/InputErrors.tsx'
import { Button } from '@/components/ui/button.tsx'

export function CreateColumnForm({
  boardId,
  onSubmit,
}: {
  boardId: string
  onSubmit: () => void
}) {
  const { createColumnForm } = useCreateColumnForm({ boardId })
  return (
    <createColumnForm.Provider>
      <form
        className="flex w-full flex-col justify-center gap-2"
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await createColumnForm.handleSubmit()
          if (createColumnForm.state.isValid) {
            onSubmit()
          }
        }}
      >
        <createColumnForm.Field
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
        </createColumnForm.Field>
        <Button variant="ghost">Crear</Button>
      </form>
    </createColumnForm.Provider>
  )
}
