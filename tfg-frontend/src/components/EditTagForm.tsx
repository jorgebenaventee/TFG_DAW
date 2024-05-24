import { useEditTagForm } from '@/hooks/use-tag-forms.ts'
import { Button } from '@/components/ui/button.tsx'
import { Label } from '@/components/ui/label.tsx'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Input } from '@/components/ui/input.tsx'
import { InputErrors } from '@/components/InputErrors.tsx'
import { TwitterPicker } from 'react-color'
import { Tag } from '@/api/tag-api.ts'

export function EditTagForm({
  boardId,
  tag,
  onSubmit,
}: {
  boardId: string
  tag: Tag
  onSubmit?: () => void
}) {
  const { editTagForm } = useEditTagForm({ boardId, tag })

  return (
    <>
      <editTagForm.Provider>
        <form
          className="flex w-full flex-col justify-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await editTagForm.handleSubmit()
            if (editTagForm.state.isValid) {
              onSubmit?.()
            }
          }}
        >
          <editTagForm.Field
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
          </editTagForm.Field>
          <editTagForm.Field
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
          </editTagForm.Field>
          <Button variant="ghost">Editar</Button>
        </form>
      </editTagForm.Provider>
    </>
  )
}
