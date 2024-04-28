import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTaskSchema } from '@/schemas/tasks/create-task.schema'
import { taskService } from '@/services/task.service'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { getLogger } from '@/utils/get-logger'
import { z } from 'zod'
import { editTaskSchema } from '@/schemas/tasks/edit-task.schema'

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

router.put('/:id', zValidator('json', editTaskSchema), async (c) => {
  const { id: taskId } = c.req.param()
  const { id: userId } = getCurrentPayload(c)
  const newTask = editTaskSchema.parse(await c.req.json())
  logger.info('Actualizando tarea', {
    taskId,
    userId,
    newTask,
  })

  const updatedTask = await taskService.editTask({
    newTask,
    taskId,
    userId,
  })

  return c.json(updatedTask)
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
  async (c) => {
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
