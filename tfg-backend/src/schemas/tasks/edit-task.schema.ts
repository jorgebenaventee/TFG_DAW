import { z } from 'zod'

export const editTaskSchema = z.object({
  name: z
    .string({ required_error: 'El campo name es requerido' })
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
  columnId: z.string().uuid(),
  boardId: z.string({ required_error: 'El campo boardId es requerido' }).uuid(),
})

export type EditTask = z.infer<typeof editTaskSchema>
