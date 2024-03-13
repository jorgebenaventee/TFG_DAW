import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { zValidator } from '@hono/zod-validator'
import {
  type CreateBoardRequest,
  createBoardSchema,
} from '@/schemas/boards/create-board.schema'
import { boardService } from '@/services/board.service'

const router = new Hono()

router.post('/', zValidator('json', createBoardSchema), async (c) => {
  const { id } = getCurrentPayload(c)
  const body = await c.req.json<CreateBoardRequest>()
  const board = await boardService.createBoard({
    ...body,
    userId: id,
  })
  return c.json(board)
})

export default router
