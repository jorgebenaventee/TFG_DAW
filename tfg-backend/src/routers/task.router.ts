import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTaskSchema } from '@/schemas/tasks/create-task.schema'
import { taskService } from '@/services/task.service'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { getLogger } from '@/utils/get-logger'

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
export default router
