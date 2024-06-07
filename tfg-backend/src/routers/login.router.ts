import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { userService } from '@/services/user.service'
import { loginSchema } from '@/schemas/auth/loginRequest'

const router = new Hono()

router.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = await c.req.json()
  const { token } = await userService.login({ username, password })
  return c.json({ token })
})

router.post('/register', zValidator('json', loginSchema), async (c) => {
  const { username, password } = await c.req.json()
  const { token } = await userService.register({ username, password })
  return c.json({ token }, { status: 201 })
})
export default router
