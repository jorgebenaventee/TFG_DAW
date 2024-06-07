import { z } from 'zod'

export const tagMutationSchema = z.object({
  name: z
    .string({ required_error: 'El nombre de la etiqueta es obligatorio' })
    .min(3, 'El nombre de la etiqueta debe tener mínimo 3 caracteres'),
  color: z
    .string({ required_error: 'El color debe estar en formato hexadecimal' })
    .regex(
      /^#([a-f0-9]{6}|[a-f0-9]{3})$/,
      'El color debe estar en formato hexadecimal',
    ),
  boardId: z.string({ required_error: 'El campo boardId es requerido' }).uuid(),
})
