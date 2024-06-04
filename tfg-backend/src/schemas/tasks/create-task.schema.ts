import { z } from 'zod'

export const createTaskSchema = z.object({
  name: z
    .string({ required_error: 'El nombre de la tarea es obligatorio' })
    .min(3, 'El nombre de la tarea debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  startDate: z.coerce
    .date()
    .refine((date) => new Date(date))
    .optional(),
  endDate: z.coerce
    .date()
    .refine((date) => new Date(date))
    .optional(),
  assignedTo: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  columnId: z
    .string({ required_error: 'El campo columnId es requerido' })
    .uuid(),
  boardId: z.string({ required_error: 'El campo boardId es requerido' }).uuid(),
})

export type CreateTask = z.infer<typeof createTaskSchema>
