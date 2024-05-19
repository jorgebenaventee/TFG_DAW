import { z } from 'zod'

export const tagMutationSchema = z.object({
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
