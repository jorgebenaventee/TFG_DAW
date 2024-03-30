import { z } from 'zod'

export const getColumnsSchema = z.object({
  boardId: z.string().uuid(),
})
