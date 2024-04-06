import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'

export const createTaskSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre de la tarea debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  assignedTo: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  columnId: z.string().uuid(),
  boardId: z.string().uuid(),
})

export const taskSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  order: z.number(),
  columnId: z.string().uuid(),
  hasImage: z.boolean().default(false),
})

export type CreateTask = z.infer<typeof createTaskSchema>
export type Task = z.infer<typeof taskSchema>

function createTask(data: CreateTask) {
  return apiFetch(
    '/task',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    taskSchema,
  )
}

export const taskApi = {
  createTask,
}
