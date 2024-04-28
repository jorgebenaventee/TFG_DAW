import { db } from '@/drizzle/db'
import { HTTPException } from 'hono/http-exception'
import { type CreateTask } from '@/schemas/tasks/create-task.schema'
import {
  type Task,
  taskTable,
  taskTagTable,
  userTaskTable,
} from '@/drizzle/schema'
import { userBoardService } from '@/services/userboard.service'
import { getLogger } from '@/utils/get-logger'
import { eq } from 'drizzle-orm'
import { type EditTask } from '@/schemas/tasks/edit-task.schema'

const logger = getLogger()

async function createTask({
  userId,
  task,
}: {
  userId: string
  task: CreateTask
}) {
  await checkPermissions({
    userId,
    boardId: task.boardId,
    columnId: task.columnId,
  })

  if (task.endDate != null && task.startDate != null) {
    if (task.startDate > task.endDate) {
      throw new HTTPException(400, {
        message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
      })
    }
  }

  const lastTask = await db.query.taskTable.findFirst({
    where: (dbTask, { eq }) => eq(dbTask.columnId, task.columnId),
    orderBy: (task, { desc }) => desc(task.order),
  })

  logger.info('La última tarea es', { lastTask })

  const order = lastTask != null ? lastTask.order + 1 : 0

  const newTask: typeof taskTable.$inferInsert = {
    order,
    name: task.name,
    columnId: task.columnId,
    description: task.description ?? null,
    startDate: task.startDate?.toISOString() ?? null,
    endDate: task.endDate?.toISOString() ?? null,
  }

  logger.info('Nueva tarea', { newTask })

  const [savedTask] = await db
    .insert(taskTable)
    .values(newTask)
    .returning()
    .execute()
  logger.info('Tarea guardada', { savedTask })
  await insertUserTasks({
    task,
    savedTask,
  })
  await insertTaskTags({
    task,
    savedTask,
  })

  return savedTask
}

async function editTask({
  userId,
  taskId,
  newTask,
}: {
  userId: string
  taskId: string
  newTask: EditTask
}) {
  const task = await db.query.taskTable.findFirst({
    where: (task, { eq }) => eq(task.id, taskId),
  })
  if (task == null) {
    logger.error('No se encontró la tarea', { taskId })
    throw new HTTPException(404, {
      message: `La tarea con id ${taskId} no existe`,
    })
  }

  await checkPermissions({
    userId,
    boardId: newTask.boardId,
    columnId: newTask.columnId,
  })

  if (newTask.endDate != null && newTask.startDate != null) {
    if (newTask.startDate > newTask.endDate) {
      throw new HTTPException(400, {
        message: 'La fecha de inicio no puede ser mayor a la fecha de fin',
      })
    }
  }

  const updatedTask: typeof taskTable.$inferInsert = {
    name: newTask.name,
    columnId: newTask.columnId,
    description: newTask.description ?? null,
    startDate: newTask.startDate?.toISOString() ?? null,
    endDate: newTask.endDate?.toISOString() ?? null,
  }

  logger.info('Tarea actualizada', { updatedTask })

  const [savedTask] = await db
    .update(taskTable)
    .set(updatedTask)
    .where(eq(taskTable.id, taskId))
    .returning()
    .execute()

  await db
    .delete(userTaskTable)
    .where(eq(userTaskTable.taskId, taskId))
    .execute()

  await db.delete(taskTagTable).where(eq(taskTagTable.taskId, taskId)).execute()

  await insertUserTasks({
    task: newTask,
    savedTask: task,
  })

  await insertTaskTags({
    task: newTask,
    savedTask: task,
  })
  return savedTask
}

async function moveTask({
  userId,
  taskId,
  newColumnId,
  boardId,
  order,
}: {
  userId: string
  taskId: string
  newColumnId: string
  boardId: string
  order: number
}) {
  await checkPermissions({
    userId,
    boardId,
    columnId: newColumnId,
  })
  logger.info('Moviendo tarea', {
    taskId,
    newColumnId,
    userId,
  })

  // Comprobar que ambas columnas estén en el mismo tablero y que sean distintas si el orden no cambia en la tarea

  const task = await db.query.taskTable.findFirst({
    where: (task, { eq }) => eq(task.id, taskId),
  })
  if (task == null) {
    logger.error('No se encontró la tarea', { taskId })
    throw new HTTPException(404, {
      message: `La tarea con id ${taskId} no existe`,
    })
  }

  const currentColumn = await db.query.columnTable.findFirst({
    where: (column, { eq }) => eq(column.id, task.columnId),
  })

  if (currentColumn == null) {
    logger.error('No se encontró la columna', { taskId })
    throw new HTTPException(404, {
      message: `La columna con id ${task.columnId} no existe`,
    })
  }

  if (currentColumn.boardId !== boardId) {
    logger.error('La columna no pertenece al tablero', { taskId })
    throw new HTTPException(400, {
      message: `La columna con id ${task.columnId} no pertenece al tablero con id ${boardId}`,
    })
  }

  if (task.columnId === newColumnId && task.order === order) {
    return
  }

  const newColumn = await db.query.columnTable.findFirst({
    where: (column, { eq }) => eq(column.id, newColumnId),
  })

  if (newColumn == null) {
    logger.error('No se encontró la nueva columna', { newColumnId })
    throw new HTTPException(404, {
      message: `La columna con id ${newColumnId} no existe`,
    })
  }

  if (newColumn.boardId !== boardId) {
    logger.error('La nueva columna no pertenece al tablero', { newColumnId })
    throw new HTTPException(400, {
      message: `La columna con id ${newColumnId} no pertenece al tablero con id ${boardId}`,
    })
  }

  let currentColumnTasks = await db.query.taskTable.findMany({
    where: (task, { eq }) => eq(task.columnId, task.columnId),
  })

  let newColumnTasks = await db.query.taskTable.findMany({
    where: (task, { eq, and, not }) =>
      and(eq(task.columnId, newColumnId), not(eq(task.id, taskId))),
  })

  currentColumnTasks = currentColumnTasks.filter((t) => t.id !== taskId)
  newColumnTasks.splice(order, 0, task)
  newColumnTasks = newColumnTasks.filter(
    (t, index) => newColumnTasks.findIndex((i) => i.id === t.id) === index,
  )

  for (let i = 0; i < currentColumnTasks.length; i++) {
    const oldTask = currentColumnTasks[i]
    await db
      .update(taskTable)
      .set({
        order: i,
      })
      .where(eq(taskTable.id, oldTask.id))
      .execute()
  }

  for (let i = 0; i < newColumnTasks.length; i++) {
    const newTask = newColumnTasks[i]
    await db
      .update(taskTable)
      .set({
        order: i,
        columnId: newColumnId,
      })
      .where(eq(taskTable.id, newTask.id))
      .execute()
  }
}

async function checkPermissions({
  userId,
  boardId,
  columnId,
}: {
  userId: string
  boardId: string
  columnId: string
}) {
  const role = await userBoardService.checkPermissions({
    userId,
    boardId,
  })
  if (role == null) {
    throw new HTTPException(403, {
      message: 'No tienes permiso para ver estas tareas',
    })
  }

  const column = await db.query.columnTable.findFirst({
    where: (column, { eq }) => eq(column.id, columnId),
  })

  if (column == null) {
    throw new HTTPException(404, {
      message: `La columna con id ${columnId} no existe`,
    })
  }

  if (column.boardId !== boardId) {
    throw new HTTPException(400, {
      message: `La columna con id ${columnId} no pertenece al tablero con id ${boardId}`,
    })
  }
}

async function insertUserTasks({
  task,
  savedTask,
}: {
  task: CreateTask
  savedTask: Task
}) {
  if (task.assignedTo == null || task.assignedTo.length === 0) {
    logger.info('No users assigned to task')
    return
  }
  const userIds = task.assignedTo.map((userId) => userId)
  logger.info('Se asignaron los siguientes usuarios a la tarea', { userIds })
  const foundUsers = await db.query.userTable.findMany({
    where: (user, { inArray }) => inArray(user.id, userIds),
  })
  if (foundUsers.length !== userIds.length) {
    logger.error('No se encontraron todos los usuarios', { foundUsers })
    const missingUsers = userIds.filter(
      (userId) => !foundUsers.some((user) => user.id === userId),
    )
    const intl = new Intl.ListFormat('es', {
      style: 'long',
      type: 'conjunction',
    })
    throw new HTTPException(400, {
      message: `Los usuarios ${intl.format(missingUsers)} no existen`,
    })
  }
  await db
    .insert(userTaskTable)
    .values(
      userIds.map((userId) => ({
        taskId: savedTask.id,
        userId,
      })),
    )
    .execute()
  logger.info('Se asignaron los usuarios a la tarea')
}

async function insertTaskTags({
  task,
  savedTask,
}: {
  task: CreateTask
  savedTask: Task
}) {
  if (task.tags == null || task.tags.length === 0) {
    logger.info('No tags assigned to task')
    return
  }
  const tagIds = task.tags.map((tagId) => tagId)
  logger.info('Se asignaron las siguientes etiquetas a la tarea', { tagIds })
  const foundTags = await db.query.tagTable.findMany({
    where: (tag, { inArray }) => inArray(tag.id, tagIds),
  })
  if (foundTags.length !== tagIds.length) {
    logger.error('No se encontraron todas las etiquetas', { foundTags })
    const missingTags = tagIds.filter(
      (tagId) => !foundTags.some((tag) => tag.id === tagId),
    )
    const intl = new Intl.ListFormat('es', {
      style: 'long',
      type: 'conjunction',
    })
    throw new HTTPException(400, {
      message: `Las etiquetas ${intl.format(missingTags)} no existen`,
    })
  }
  await db
    .insert(taskTagTable)
    .values(
      tagIds.map((tagId) => ({
        taskId: savedTask.id,
        tagId,
      })),
    )
    .execute()
  logger.info('Se asignaron las etiquetas a la tarea')
}

export const taskService = {
  createTask,
  moveTask,
  editTask,
}
