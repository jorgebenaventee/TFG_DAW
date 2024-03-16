import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'

export const boardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z.string().nullish(),
})

export type Board = z.infer<typeof boardSchema>

function getBoards() {
  return apiFetch('/board', {}, z.array(boardSchema))
}

export const boardApi = {
  getBoards,
}
