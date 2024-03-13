import { type Context } from 'hono'
import { z } from 'zod'

const tokenSchema = z.object({
  id: z.string(),
})

export function getCurrentPayload(c: Context) {
  const token = c.get('jwtPayload')
  return tokenSchema.parse(token)
}
