import { useAddTagForm } from '@/hooks/use-tag-forms.ts'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Input } from '@/components/ui/input.tsx'
import { InputErrors } from '@/components/InputErrors.tsx'
import { TwitterPicker } from 'react-color'

export function AddTagForm({
  boardId,
  onSubmit,
}: {
  boardId: string
  onSubmit?: () => void
}) {
  const { addTagForm } = useAddTagForm({ boardId })

  return (
    <>
      <addTagForm.Provider>
        <form
          className="flex w-full flex-col justify-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await addTagForm.handleSubmit()
            if (addTagForm.state.isValid) {
              onSubmit?.()
            }
          }}
        >
          <addTagForm.Field
            validatorAdapter={zodValidator}
            name="name"
            validators={{
              onSubmit: z.string().min(1, 'El nombre no puede estar vacío'),
            }}
          >
            {(field) => (
              <Label className="flex flex-col gap-2">
                Nombre
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <InputErrors field={field} />
              </Label>
            )}
          </addTagForm.Field>
          <addTagForm.Field
            validatorAdapter={zodValidator}
            name="color"
            validators={{
              onSubmit: z
                .string()
                .regex(
                  /^#([a-f0-9]{6}|[a-f0-9]{3})$/,
                  'El color debe estar en formato hexadecimal',
                ),
            }}
          >
            {(field) => (
              <Label className="flex flex-col gap-2">
                Color
                <TwitterPicker
                  triangle="hide"
                  color={field.getValue()}
                  onChangeComplete={(color) => field.handleChange(color.hex)}
                />
              </Label>
            )}
          </addTagForm.Field>
          <Button variant="ghost">Añadir</Button>
        </form>
      </addTagForm.Provider>
    </>
  )
}
