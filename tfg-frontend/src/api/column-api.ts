import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'
import { taskSchema } from '@/api/task-api.ts'

export const columnSchema = z.object({
  id: z.string().uuid(),
  boardId: z.string().uuid(),
  name: z.string(),
  order: z.number(),
  tasks: z.array(taskSchema).min(0).optional(),
})

const createColumnSchema = columnSchema.omit({ order: true, id: true })

export type Column = z.infer<typeof columnSchema>

function getColumns({ boardId }: { boardId: string }) {
  const queryParams = new URLSearchParams([['boardId', boardId]])
  const url = `/column?${queryParams}`
  return apiFetch(url, {}, z.array(columnSchema))
}

function createColumn(data: z.infer<typeof createColumnSchema>) {
  return apiFetch('/column', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function editColumn(id: Column['id'], data: { name: string; boardId: string }) {
  return apiFetch(`/column/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

function deleteColumn(id: Column['id']) {
  return apiFetch(`/column/${id}`, {
    method: 'DELETE',
    responseIsJson: false,
  })
}

export const columnApi = {
  getColumns,
  createColumn,
  editColumn,
  deleteColumn,
}
