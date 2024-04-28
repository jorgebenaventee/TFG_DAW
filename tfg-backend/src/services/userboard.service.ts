import { getLogger } from '@/utils/get-logger'
import { db } from '@/drizzle/db'
import { userBoardTable, userTable } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

const logger = getLogger()

async function checkPermissions({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
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

async function getUsersInBoard({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  await checkPermissions({
    userId,
    boardId,
  })
  return await db
    .select({
      id: userTable.id,
      username: userTable.username,
    })
    .from(userBoardTable)
    .innerJoin(userTable, eq(userTable.id, userBoardTable.userId))
    .where(eq(userBoardTable.boardId, boardId))
    .execute()
}

export const userBoardService = {
  checkPermissions,
  getUsersInBoard,
}
