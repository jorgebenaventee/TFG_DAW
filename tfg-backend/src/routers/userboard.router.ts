import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { userBoardService } from '@/services/userboard.service'

const router = new Hono()

router.get('/:boardId/users', async (c) => {
  const { id } = getCurrentPayload(c)
  const { boardId } = c.req.param()

  const usersInBoard = await userBoardService.getUsersInBoard({
    userId: id,
    boardId,
  })

  return c.json(usersInBoard)
})

export default router
