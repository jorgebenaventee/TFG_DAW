import { z } from 'zod'
import { apiFetch } from '@/utils/api-fetch.ts'
import { tagSchema } from '@/api/tag-api.ts'

export const createTaskSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre de la tarea debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  assignedTo: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  columnId: z.string().uuid(),
  boardId: z.string().uuid(),
})

export const taskSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  order: z.number(),
  columnId: z.string().uuid(),
  hasImage: z.boolean().default(false),
  assignedTo: z.array(z.string().uuid()).optional(),
  tags: z.array(tagSchema).optional(),
})

export const editTaskSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(3, 'El nombre de la tarea debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z.coerce.date().nullish(),
  endDate: z.coerce.date().nullish(),
  assignedTo: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  columnId: z.string().uuid(),
  boardId: z.string().uuid(),
})

export type CreateTask = z.infer<typeof createTaskSchema>
export type EditTask = z.infer<typeof editTaskSchema>
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

function updateTask({
  taskId,
  newTask,
}: {
  taskId: string
  newTask: CreateTask
}) {
  return apiFetch(
    `/task/${taskId}`,
    {
      method: 'PUT',
      body: JSON.stringify(newTask),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    taskSchema,
  )
}

function moveTask(data: {
  taskId: string
  newColumnId: string
  boardId: string
  order: number
}) {
  return apiFetch('/task/move', {
    method: 'PUT',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const taskApi = {
  createTask,
  updateTask,
  moveTask,
}
