import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'

export const boardSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  image: z
    .instanceof(File)
    .refine((file) => {
      if (file == null) return true
      return file.size < 1024 * 1024 * 2
    }, 'La imagen no puede tener un tamaño mayor a 2MB')
    .refine((file) => {
      if (file == null) return true
      return file.type.startsWith('image/')
    }, 'El archivo debe ser una imagen')
    .or(z.string())
    .nullish(),
})

export type Board = z.infer<typeof boardSchema>

function getBoards() {
  return apiFetch('/board', {}, z.array(boardSchema))
}

function getBoardImage({ id }: Board) {
  return apiFetch(`/board/${id}/image`, { responseIsJson: false }).then(
    async (res) => {
      return await res.blob()
    },
  )
}

function getUsersInBoard(boardId: string) {
  return apiFetch(
    `/userboard/${boardId}/users`,
    {},
    z.array(
      z.object({
        id: z.string().uuid(),
        username: z.string(),
      }),
    ),
  )
}

function createBoard(data: Omit<Board, 'id'>) {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.image != null) {
    formData.append('image', data.image)
  }
  return apiFetch(
    '/board',
    {
      body: formData,
      method: 'POST',
      headers: {},
    },
    boardSchema,
  )
}

export const boardApi = {
  getBoards,
  getBoardImage,
  createBoard,
  getUsersInBoard,
}
