import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { userService } from '@/services/user.service'

const router = new Hono()

router.post(
  '/login',
  zValidator(
    'json',
    z.object({
      username: z.string(),
      password: z.string(),
    }),
  ),
  async (c) => {
    const { username, password } = await c.req.json()
    const { token } = await userService.login({ username, password })
    return c.json({ token })
  },
)
export default router
