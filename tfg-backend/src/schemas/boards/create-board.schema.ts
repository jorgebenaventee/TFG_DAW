import { z } from 'zod'

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre del tablero debe tener al menos 3 caracteres'),
})

export type CreateBoardRequest = z.infer<typeof createBoardSchema>
