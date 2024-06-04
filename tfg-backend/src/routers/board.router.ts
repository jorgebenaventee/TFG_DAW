import { Hono } from 'hono'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { zValidator } from '@hono/zod-validator'
import { createBoardSchema } from '@/schemas/boards/create-board.schema'
import { boardService } from '@/services/board.service'
import { getLogger } from '@/utils/get-logger'
import { z } from 'zod'
import { registerJwt } from '@/utils/register-jwt'

const router = new Hono()
router.use('*', registerJwt())
const logger = getLogger()
router.get('/', async (c) => {
  const { id } = getCurrentPayload(c)
  logger.info('Getting boards for user', { userId: id })
  const boards = await boardService.getBoards({ userId: id })

  return c.json(boards)
})

router.get(
  '/:id',
  zValidator('param', z.object({ id: z.string().uuid() })),
  async (c) => {
    const boardId = c.req.param('id')
    logger.info('Obteniendo tablero', { boardId })
    const { id: userId } = getCurrentPayload(c)
    const board = await boardService.getBoard({ userId, boardId })
    return c.json(board)
  },
)

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
