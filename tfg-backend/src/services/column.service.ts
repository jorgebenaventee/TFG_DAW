import { db } from '@/drizzle/db'
import { and, eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import { columnTable, userBoardTable } from '@/drizzle/schema'
import { getLogger } from '@/utils/get-logger'

const logger = getLogger()

async function getColumns({
  boardId,
  userId,
}: {
  boardId: string
  userId: string
}) {
  logger.info('Obteniendo columnas', {
    boardId,
    userId,
  })
  await checkPermissions({
    boardId,
    userId,
  })
  return await db
    .select()
    .from(columnTable)
    .where(eq(columnTable.boardId, boardId))
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
  const isAdmin = await hasAdminPermissions({ userId, boardId })
  if (!isAdmin) {
    logger.error('No tienes permisos para crear columnas en este tablero', {
      userId,
      boardId,
    })
    throw new HTTPException(403, {
      message: 'No tienes permisos para crear columnas en este tablero',
    })
  }

  return await db
    .insert(columnTable)
    .values({ name, boardId })
    .returning()
    .execute()
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
  logger.info('Verificando permisos', {
    boardId,
    userId,
  })
  const [userBoard] = await db
    .select()
    .from(userBoardTable)
    .where(
      and(
        eq(userBoardTable.userId, userId),
        eq(userBoardTable.boardId, boardId),
      ),
    )
    .limit(1)
    .execute()
  if (userBoard == null) {
    logger.error('No se encontró el tablero o el usuario no tiene permisos', {
      boardId,
      userId,
    })
    throw new HTTPException(403, {
      message: 'No tienes permisos para ver las columnas de este tablero',
    })
  }

  return userBoard.role
}

export const columnService = {
  getColumns,
  createColumn,
}
