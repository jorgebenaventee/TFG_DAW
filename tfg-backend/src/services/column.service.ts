import { db } from '@/drizzle/db'
import { HTTPException } from 'hono/http-exception'
import {
  columnTable,
  taskTable,
  type TaskTag,
  type UserTask,
} from '@/drizzle/schema'
import { getLogger } from '@/utils/get-logger'
import { userBoardService } from '@/services/userboard.service'
import { and, eq } from 'drizzle-orm'

const logger = getLogger()

async function getColumns({
  boardId,
  userId,
}: {
  boardId: string
  userId: string
}): Promise<ColumnResponse[]> {
  logger.info('Obteniendo columnas', {
    boardId,
    userId,
  })
  await checkPermissions({
    boardId,
    userId,
  })
  const columns = await db.query.columnTable.findMany({
    where: (columns, { eq }) => eq(columns.boardId, boardId),
    orderBy: (columns, { asc }) => [asc(columns.order), asc(taskTable.order)],
    with: {
      tasks: {
        with: {
          userTasks: true,
          taskTags: true,
        },
      },
    },
  })
  return columns.map((column) => {
    return {
      ...column,
      tasks: column.tasks
        .map((task) => {
          return {
            ...task,
            assignedTo: task.userTasks.map(
              (userTask: UserTask) => userTask.userId,
            ),
            tags: task.taskTags.map((taskTag: TaskTag) => taskTag.tagId),
          }
        })
        // @ts-expect-error Somehow typescript does not infer this correctly
        .toSorted((a, b) => a.order - b.order),
    }
  }) as ColumnResponse[]
}

async function createColumn({
  boardId,
  userId,
  name,
}: {
  boardId: string
  userId: string
  name: string
}) {
  logger.info('Creando columna', {
    boardId,
    userId,
    name,
  })
  const isAdmin = await hasAdminPermissions({
    userId,
    boardId,
  })
  if (!isAdmin) {
    logger.error('No tienes permisos para crear columnas en este tablero', {
      userId,
      boardId,
    })
    throw new HTTPException(403, {
      message: 'No tienes permisos para crear columnas en este tablero',
    })
  }

  const column = await db.query.columnTable.findFirst({
    columns: {
      order: true,
    },
    where: (columns, { eq }) => eq(columns.boardId, boardId),
    orderBy: (columns, { desc }) => [desc(columns.order)],
  })

  const nextOrder = column?.order ?? -1

  return await db
    .insert(columnTable)
    .values({
      name,
      boardId,
      order: nextOrder + 1,
    })
    .returning()
    .execute()
}

async function editColumn({
  userId,
  boardId,
  name,
  columnId,
}: {
  userId: string
  boardId: string
  name: string
  columnId: string
}) {
  logger.info('Editando columna', { userId, boardId, columnId, newName: name })
  const isAdmin = await hasAdminPermissions({ userId, boardId })
  if (!isAdmin) {
    logger.error('No tienes permiso para editar columnas en este tablero', {
      userId,
      boardId,
    })
    throw new HTTPException(403, {
      message: 'No tienes permiso para editar columnas en este tablero',
    })
  }

  const updatedRows = await db
    .update(columnTable)
    .set({ name })
    .where(and(eq(columnTable.id, columnId), eq(columnTable.boardId, boardId)))
    .returning({ updatedName: columnTable.id })

  if (updatedRows.length === 0) {
    throw new HTTPException(404, { message: 'No se ha encontrado la columna' })
  }
}

async function hasAdminPermissions({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  return (
    (await checkPermissions({
      userId,
      boardId,
    })) === 'ADMIN'
  )
}

async function checkPermissions({
  boardId,
  userId,
}: {
  boardId: string
  userId: string
}) {
  return await userBoardService.checkPermissions({
    userId,
    boardId,
  })
}

export const columnService = {
  getColumns,
  createColumn,
  editColumn,
}
