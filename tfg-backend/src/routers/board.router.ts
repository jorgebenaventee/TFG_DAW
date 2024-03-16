import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { zValidator } from '@hono/zod-validator'
import {
  type CreateBoardRequest,
  createBoardSchema,
} from '@/schemas/boards/create-board.schema'
import { boardService } from '@/services/board.service'

const router = new Hono()

router.get('/', async (c) => {
  const { id } = getCurrentPayload(c)
  const boards = await boardService.getBoards({ userId: id })

  return c.json(boards)
})
router.post('/', zValidator('json', createBoardSchema), async (c) => {
  const { id } = getCurrentPayload(c)
  const body = await c.req.json<CreateBoardRequest>()
  const board = await boardService.createBoard({
    ...body,
    userId: id,
  })
  return c.json(board)
})

router.delete('/:id', async (c) => {
  const { id } = getCurrentPayload(c)
  const boardId = c.req.param('id')
  await boardService.deleteBoard({ userId: id, boardId })
  return c.json({ message: 'Tablero eliminado' })
})
export default router
