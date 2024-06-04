import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { createTaskSchema } from '@/schemas/tasks/create-task.schema'
import { taskService } from '@/services/task.service'
import { getCurrentPayload } from '@/utils/get-current-payload'
import { getLogger } from '@/utils/get-logger'
import { z } from 'zod'
import { editTaskSchema } from '@/schemas/tasks/edit-task.schema'
import { registerJwt } from '@/utils/register-jwt'

const router = new Hono()
router.use('*', registerJwt())
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
      taskId: z
        .string({ required_error: 'El campo taskId es requerido' })
        .uuid(),
      newColumnId: z
        .string({ required_error: 'El campo newColumnId es requerido' })
        .uuid(),
      boardId: z
        .string({ required_error: 'El campo boardId es requerido' })
        .uuid(),
      order: z.number({ required_error: 'El campo order es requerido' }),
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

router.get(
  '/ai/description',
  zValidator('query', z.object({ title: z.string().min(1) })),
  async (c) => {
    const title = c.req.query('title')
    if (!title) {
      return new Response(
        JSON.stringify({
          error: 'El título es obligatorio para poder generar la descripción',
        }),
        { status: 400 },
      )
    }
    const descriptionAI = await taskService.generateDescription({ title })
    return c.json({ description: descriptionAI })
  },
)

export default router
