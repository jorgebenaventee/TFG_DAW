import { getLogger } from '@/utils/get-logger'
import { db } from '@/drizzle/db'
import { UserBoard, userBoardTable, userTable } from '@/drizzle/schema'
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
      name: userTable.name,
      lastName: userTable.lastName,
    })
    .from(userBoardTable)
    .innerJoin(userTable, eq(userTable.id, userBoardTable.userId))
    .where(eq(userBoardTable.boardId, boardId))
    .execute()
}

async function addUserToBoard({
  username,
  boardId,
  currentUserId,
  role,
}: {
  username: string
  boardId: string
  currentUserId: string
  role: UserBoard['role']
}) {
  await checkPermissions({ userId: currentUserId, boardId })

  const userToAdd = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  })
  if (!userToAdd) {
    throw new HTTPException(404, {
      message: 'No se ha encontrado el usuario a añadir',
    })
  }

  const existingUser = await db.query.userBoardTable.findFirst({
    where: (userBoard, { and, eq }) =>
      and(eq(userBoard.userId, userToAdd.id), eq(userBoard.boardId, boardId)),
  })

  if (existingUser) {
    throw new HTTPException(400, {
      message: 'Ese usuario ya pertenece al tablero',
    })
  }

  const [newUserBoard] = await db
    .insert(userBoardTable)
    .values([{ userId: userToAdd.id, boardId, role }])
    .returning()
    .execute()
  return newUserBoard
}

async function removeUserFromBoard({
  userId,
  boardId,
  currentUserId,
}: {
  userId: string
  boardId: string
  currentUserId: string
}) {
  await checkPermissions({ userId: currentUserId, boardId })

  if (userId === currentUserId) {
    throw new HTTPException(403, {
      message: 'No te puedes eliminar a ti mismo del tablero',
    })
  }

  const userToRemove = await db.query.userBoardTable.findFirst({
    where: (userBoard, { and, eq }) =>
      and(eq(userBoard.userId, userId), eq(userBoard.boardId, boardId)),
  })

  if (!userToRemove) {
    throw new HTTPException(404, {
      message: 'No se ha encontrado el usuario a eliminar en el tablero',
    })
  }

  await db
    .delete(userBoardTable)
    .where(
      and(
        eq(userBoardTable.userId, userId),
        eq(userBoardTable.boardId, boardId),
      ),
    )
    .execute()
}

export const userBoardService = {
  checkPermissions,
  getUsersInBoard,
  addUserToBoard,
  removeUserFromBoard,
}
