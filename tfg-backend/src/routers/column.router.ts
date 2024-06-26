import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getColumnsSchema } from '@/schemas/columns/get-columns.schema'
import { getLogger } from '@/utils/get-logger'
import { columnService } from '@/services/column.service'
import { columnSchema } from '@/schemas/columns/column.schema'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { registerJwt } from '@/utils/register-jwt'

const router = new Hono()
router.use('*', registerJwt())
const logger = getLogger()
router.get('/', zValidator('query', getColumnsSchema), async (c) => {
  const { boardId } = c.req.query()
  const { id: userId } = getCurrentPayload(c)
  logger.info('Obteniendo columnas', {
    boardId,
    userId,
  })
  const columns = await columnService.getColumns({
    boardId,
    userId,
  })
  logger.info(`Se encontraron ${columns.length} columnas `, {})

  return c.json(columns)
})

router.post('/', zValidator('json', columnSchema), async (c) => {
  const { boardId, name } = await c.req.json()
  const { id: userId } = getCurrentPayload(c)

  logger.info('Creando columna', {
    boardId,
    name,
  })

  const column = await columnService.createColumn({
    boardId,
    userId,
    name,
  })

  logger.info('Columna creada', {
    boardId,
    userId,
    name,
  })

  return c.json(column, { status: 201 })
})

router.put('/:id', zValidator('json', columnSchema), async (c) => {
  const { boardId, name } = await c.req.json()
  const { id: userId } = getCurrentPayload(c)
  const { id: columnId } = c.req.param()

  logger.info('Editando columna', { boardId, name, userId, columnId })
  await columnService.editColumn({ boardId, name, userId, columnId })
  logger.info('Columna editada', { boardId, name, userId, columnId })

  return new Response(null, { status: 204 })
})

router.delete('/:id', async (c) => {
  const { id: userId } = getCurrentPayload(c)
  const { id: columnId } = c.req.param()

  logger.info('Eliminando columna', { userId, columnId })
  await columnService.deleteColumn({ userId, columnId })
  logger.info('Columna eliminada', { userId, columnId })

  return new Response(null, { status: 204 })
})
export default router
