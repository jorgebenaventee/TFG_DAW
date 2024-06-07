import { z } from 'zod'

export const columnSchema = z.object({
  name: z
    .string({ required_error: 'El nombre de la columna es obligatorio' })
    .min(3, 'El nombre de la columna debe tener al menos 3 caracteres'),
  boardId: z.string({ required_error: 'El campo boardId es requerido' }).uuid(),
})
