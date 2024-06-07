import { z } from 'zod'

export const loginSchema = z.object({
  username: z
    .string({ required_error: 'El nombre de usuario es requerido' })
    .min(1, 'El nombre de usuario es requerido'),
  password: z
    .string({ required_error: 'La contraseña es requerida' })
    .min(1, 'La contraseña es requerida'),
})

export type LoginRequest = z.infer<typeof loginSchema>
