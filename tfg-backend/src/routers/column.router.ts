import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getColumnsSchema } from '@/schemas/columns/get-columns.schema'
import { getLogger } from '@/utils/get-logger'
import { columnService } from '@/services/column.service'
import { createColumnSchema } from '@/schemas/columns/create-column.schema'
import { getCurrentPayload } from '@/utils/get-current-payload'

const router = new Hono()
const logger = getLogger()
router.get('/', zValidator('query', getColumnsSchema), async (c) => {
  const { boardId, userId } = c.req.query()
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

router.post('/', zValidator('json', createColumnSchema), async (c) => {
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
export default router
