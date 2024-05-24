import { tagMutationSchema } from '@/schemas/tags/tag.schema'
import { tagService } from '@/services/tag.service'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { getLogger } from '@/utils/get-logger'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

const router = new Hono()
const logger = getLogger()

router.get(
  '/',
  zValidator('query', z.object({ boardId: z.string().uuid() })),
  async (c) => {
    const { id: userId } = getCurrentPayload(c)
    const boardId = c.req.query().boardId
    const tag = await tagService.getTagsInBoard({
      userId,
      boardId,
    })
    return c.json(tag)
  },
)
router.get(
  '/:id',
  zValidator('param', z.object({ tagId: z.string().uuid() })),
  async (c) => {
    const { id: userId } = getCurrentPayload(c)
    const tagId = c.req.param('id')
    logger.info('Obteniendo etiqueta', { userId, tagId })
    const tag = tagService.getTag({ userId, tagId })
    logger.info('Etiqueta obtenida', { userId, tagId })
    return c.json(tag)
  },
)

router.post('/', zValidator('json', tagMutationSchema), async (c) => {
  const { id: userId } = getCurrentPayload(c)
  const tag = await c.req.json()
  logger.info('Insertando etiqueta', { userId, tag })
  const newTag = await tagService.insertTag({ userId, tag })
  logger.info('Etiqueta insertada', { userId, newTag })
  return c.json(newTag)
})

router.put(
  '/:tagId',
  zValidator('param', z.object({ tagId: z.string().uuid() })),
  zValidator('json', tagMutationSchema),
  async (c) => {
    const { id: userId } = getCurrentPayload(c)
    const tagId = c.req.param('tagId')
    const tag = await c.req.json()
    logger.info('Actualizando etiqueta', { userId, tagId, tag })
    const updatedTag = await tagService.updateTag({ userId, tag })
    logger.info('Etiqueta actualizada', { userId, tagId, updatedTag })
    return c.json(updatedTag)
  },
)

router.delete('/:id', async (c) => {
  const { id: userId } = getCurrentPayload(c)
  const tagId = c.req.param('id')
  logger.info('Borrando etiqueta', { userId, tagId })
  await tagService.deleteTag({ userId, tagId })
  logger.info('Etiqueta borrada', { userId, tagId })
  return new Response(null, { status: 204 })
})

export default router
