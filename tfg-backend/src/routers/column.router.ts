import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getColumnsSchema } from '@/schemas/columns/get-columns.schema'
import { getLogger } from '@/utils/get-logger'
import { columnService } from '@/services/column.service'
import { columnSchema } from '@/schemas/columns/column.schema'
import { getCurrentPayload } from '@/utils/get-current-payload'

const router = new Hono()
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

  return c.json(column)
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
export default router
