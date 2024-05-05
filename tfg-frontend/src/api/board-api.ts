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

const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  name: z.string(),
  lastName: z.string(),
})

export type User = z.infer<typeof userSchema>

function getBoards() {
  return apiFetch('/board', {}, z.array(boardSchema))
}

function getBoard({ boardId }: { boardId: string }) {
  return apiFetch(`/board/${boardId}`, {}, boardSchema)
}

function getBoardImage({ id }: Board) {
  return apiFetch(`/board/${id}/image`, { responseIsJson: false }).then(
    async (res) => {
      return await res.blob()
    },
  )
}

function getUsersInBoard(boardId: string) {
  return apiFetch(`/userboard/${boardId}/users`, {}, z.array(userSchema))
}

function addUserToBoard(body: {
  boardId: string
  username: string
  role: string
}) {
  return apiFetch(`/userboard`, { body: JSON.stringify(body), method: 'POST' })
}

function removeUserFromBoard(body: { boardId: string; userId: string }) {
  return apiFetch(`/userboard`, {
    body: JSON.stringify(body),
    method: 'DELETE',
    responseIsJson: false,
  })
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
  getBoard,
  getBoards,
  getBoardImage,
  createBoard,
  getUsersInBoard,
  addUserToBoard,
  removeUserFromBoard,
}
