import { z } from 'zod'

export const createBoardSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre del tablero debe tener al menos 3 caracteres'),
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
    .nullish(),
})

export type CreateBoardRequest = z.infer<typeof createBoardSchema>
