import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'

export const tagSchema = z.object({
  id: z
    .string()
    .uuid({ message: 'El id de la etiqueta debe ser un UUID' })
    .nullish(),
  name: z
    .string()
    .min(3, 'El nombre de la etiqueta debe tener mínimo 3 caracteres'),
  color: z
    .string()
    .regex(
      /^#([a-f0-9]{6}|[a-f0-9]{3})$/,
      'El color debe estar en formato hexadecimal',
    ),
  boardId: z.string().uuid({ message: 'El id de tablero debe ser un UUID' }),
})

export type Tag = z.infer<typeof tagSchema> & { id?: string }

function getTags({ boardId }: { boardId: string }) {
  const urlParams = new URLSearchParams({ boardId })
  return apiFetch(`/tag?${urlParams}`, {}, z.array(tagSchema))
}

function getTag({ tagId }: { tagId: string }) {
  return apiFetch(`/tag/${tagId}`, {}, tagSchema)
}

function insertTag(tag: Tag) {
  return apiFetch(`/tag`, { body: JSON.stringify(tag), method: 'POST' })
}

function updateTag({ tagId, tag }: { tagId: string; tag: Tag }) {
  return apiFetch(`/tag/${tagId}`, { body: JSON.stringify(tag), method: 'PUT' })
}

function deleteTag({ tagId }: { tagId: string }) {
  return apiFetch(`/tag/${tagId}`, { method: 'DELETE', responseIsJson: false })
}

export const tagApi = {
  getTags,
  getTag,
  insertTag,
  deleteTag,
  updateTag,
}
