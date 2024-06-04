import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { userBoardService } from '@/services/userboard.service'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { registerJwt } from '@/utils/register-jwt'

const router = new Hono()
router.use('*', registerJwt())

router.get('/:boardId/users', async (c) => {
  const { id } = getCurrentPayload(c)
  const { boardId } = c.req.param()

  const usersInBoard = await userBoardService.getUsersInBoard({
    userId: id,
    boardId,
  })

  return c.json(usersInBoard)
})

router.post(
  '/',
  zValidator(
    'json',
    z.object({
      username: z.string().min(1),
      boardId: z.string().uuid(),
      role: z.enum(['ADMIN', 'USER'], {
        message: 'El rol solo puede ser ADMIN o USER',
      }),
    }),
  ),
  async (c) => {
    const { id: currentUserId } = getCurrentPayload(c)
    const {
      username,
      boardId,
      role,
    }: { username: string; boardId: string; role: 'ADMIN' | 'USER' } =
      await c.req.json()

    const userBoard = await userBoardService.addUserToBoard({
      currentUserId,
      username,
      boardId,
      role,
    })

    return c.json(userBoard)
  },
)

router.delete(
  '/',
  zValidator(
    'json',
    z.object({
      userId: z.string().uuid(),
      boardId: z.string().uuid(),
    }),
  ),
  async (c) => {
    const { id: currentUserId } = getCurrentPayload(c)
    const { userId, boardId }: { userId: string; boardId: string } =
      await c.req.json()

    await userBoardService.removeUserFromBoard({
      currentUserId,
      userId,
      boardId,
    })

    return new Response(null, { status: 204 })
  },
)
export default router
