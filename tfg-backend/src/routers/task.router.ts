import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTaskSchema } from '@/schemas/tasks/create-task.schema'
import { taskService } from '@/services/task.service'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { getLogger } from '@/utils/get-logger'
import { z } from 'zod'

const router = new Hono()
const logger = getLogger()
router.post('/', zValidator('json', createTaskSchema), async (c) => {
  const task = createTaskSchema.parse(await c.req.json())
  const { id } = getCurrentPayload(c)
  logger.info('Creando tarea', {
    task,
    userId: id,
  })
  const newTask = await taskService.createTask({
    userId: id,
    task,
  })
  return c.json(newTask, 201)
})

router.put(
  '/move',
  zValidator(
    'json',
    z.object({
      taskId: z.string().uuid(),
      newColumnId: z.string().uuid(),
      boardId: z.string().uuid(),
      order: z.number(),
    }),
  ),
  async (c, next) => {
    const { id } = getCurrentPayload(c)
    const { taskId, newColumnId, boardId, order } = await c.req.json()

    await taskService.moveTask({
      userId: id,
      taskId,
      newColumnId,
      boardId,
      order,
    })

    return c.json({ message: 'Tarea movida' })
  },
)
export default router
