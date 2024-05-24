import { Label } from './ui/label'
import { Input } from './ui/input'
import { InputErrors } from './InputErrors'
import { Button } from './ui/button'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useAddUserBoardForm } from '@/hooks/use-add-user-board'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function AddUserBoardForm({
  boardId,
  onSubmit,
}: {
  boardId: string
  onSubmit?: () => void
}) {
  const { addUserToBoardForm } = useAddUserBoardForm({
    boardId,
  })

  return (
    <>
      <addUserToBoardForm.Provider>
        <form
          className="flex w-full flex-col justify-center gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()
            await addUserToBoardForm.handleSubmit()
            if (addUserToBoardForm.state.isValid) {
              onSubmit?.()
            }
          }}
        >
          <addUserToBoardForm.Field
            validatorAdapter={zodValidator}
            name="username"
            validators={{
              onSubmit: z
                .string()
                .min(1, 'El nombre de usuario no puede estar vacío'),
            }}
          >
            {(field) => (
              <Label className="flex flex-col gap-2">
                Usuario
                <Input
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <InputErrors field={field} />
              </Label>
            )}
          </addUserToBoardForm.Field>
          <addUserToBoardForm.Field
            validatorAdapter={zodValidator}
            name="role"
            validators={{
              onSubmit: z.string().min(1, 'Seleccione un rol'),
            }}
          >
            {(field) => (
              <Label className="flex flex-col gap-2">
                Rol
                <Select
                  onValueChange={field.handleChange}
                  value={field.getValue()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="USER">Usuario</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Label>
            )}
          </addUserToBoardForm.Field>
          <Button variant="ghost">Añadir</Button>
        </form>
      </addUserToBoardForm.Provider>
    </>
  )
}
