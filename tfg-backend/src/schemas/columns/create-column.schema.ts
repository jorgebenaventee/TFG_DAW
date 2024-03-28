import { z } from 'zod'

export const createColumnSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre de la columna debe tener al menos 3 caracteres'),
  boardId: z.string().uuid(),
})
