import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { zValidator } from '@hono/zod-validator'
import { createBoardSchema } from '@/schemas/boards/create-board.schema'
import { boardService } from '@/services/board.service'
import { getLogger } from '@/utils/get-logger'

const router = new Hono()
const logger = getLogger()
router.get('/', async (c) => {
  const { id } = getCurrentPayload(c)
  logger.info('Getting boards for user', { userId: id })
  const boards = await boardService.getBoards({ userId: id })

  return c.json(boards)
})

router.get('/:id/image', async (c) => {
  const boardId = c.req.param('id')
  logger.info('Getting image for board', { boardId })
  const image = await boardService.getBoardImage({ boardId })
  return c.newResponse(image)
})

router.post('/', zValidator('form', createBoardSchema), async (c) => {
  const { id } = getCurrentPayload(c)
  const formData = await c.req.formData()
  const name = formData.get('name')
  const image = formData.get('image')
  const imageFile = image instanceof File ? image : null
  logger.info('Creating board', { name, image: Boolean(imageFile) })
  const board = await boardService.createBoard({
    name: String(name),
    image: imageFile,
    userId: id,
  })
  return c.json(board)
})

router.delete('/:id', async (c) => {
  const { id } = getCurrentPayload(c)
  const boardId = c.req.param('id')
  logger.info('Deleting board', { boardId })
  await boardService.deleteBoard({
    userId: id,
    boardId,
  })
  return c.json({ message: 'Tablero eliminado' })
})
export default router
