import { type CreateBoardRequest } from '@/schemas/boards/create-board.schema'
import { db } from '@/drizzle/db'
import {
  type Board,
  boardTable,
  BoardVm,
  columnTable,
  tagTable,
  taskTable,
  taskTagTable,
  User,
  UserBoard,
  userBoardTable,
  userTaskTable,
} from '@/drizzle/schema'
import { eq, inArray } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'
import * as path from 'path'
import * as fs from 'fs/promises'
import { getLogger } from '@/utils/get-logger'

const logger = getLogger()

function mapBoard(board: Board, userBoard?: UserBoard, currentUser?: User) {
  const boardVm: BoardVm = {
    ...board,
    isAdmin: Boolean(currentUser?.isSuperAdmin || userBoard?.role === 'ADMIN'),
  }
  if (boardVm.image != null) {
    const image = path.basename(boardVm.image)
    const hyphenIndex = image.indexOf('-')
    const name = image.slice(hyphenIndex + 1)
    return {
      ...boardVm,
      image: name,
    }
  }
  return boardVm
}

async function getBoards({ userId }: { userId: string }) {
  logger.info('Obteniendo tableros', { userId })
  const user = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  })
  if (!user) {
    throw new HTTPException(403, {
      message: 'No tienes permisos para ver los tableros',
    })
  }

  if (user.isSuperAdmin) {
    const allBoards = await db.query.boardTable.findMany()
    return allBoards.map((board) => mapBoard(board, undefined, user))
  }
  const userBoards = await db.query.userBoardTable.findMany({
    where: (userBoard, { eq }) => eq(userBoard.userId, userId),
  })

  if (userBoards.length === 0) {
    return []
  }

  const boards = await db.query.boardTable.findMany({
    where: (board, { inArray }) =>
      inArray(
        board.id,
        userBoards.map((ub) => ub.boardId),
      ),
  })
  logger.info('Tableros obtenidos', {
    userId,
    boards: boards.length,
  })
  return boards.map((board) =>
    mapBoard(board, userBoards.find((ub) => ub.boardId === board.id)!, user),
  )
}

async function getBoard({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  logger.info('Obteniendo tablero', { userId, boardId })
  const user = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  })
  const userBoard = await db.query.userBoardTable.findFirst({
    where: (userBoard, { eq, and }) =>
      and(eq(userBoard.userId, userId), eq(userBoard.boardId, boardId)),
  })

  if (!user?.isSuperAdmin && !userBoard) {
    logger.error('El usuario no pertenece al tablero', { userId, boardId })
    throw new HTTPException(403, {
      message: 'No tienes permiso para ver este tablero',
    })
  }

  const board = (await db.query.boardTable.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  }))!

  return mapBoard(board, userBoard, user)
}

async function getBoardImage({ boardId }: { boardId: string }) {
  logger.info('Obteniendo imagen del tablero', { boardId })
  const board = await db.query.boardTable.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  })

  if (board?.image == null) {
    logger.error('Tablero o imagen no encontrados', { boardId })
    throw new HTTPException(404, {
      message: 'No se ha encontrado el tablero con id ' + boardId,
    })
  }

  const image = await fs.readFile(board.image)
  logger.info('Imagen del tablero obtenida', { boardId })
  return image
}

async function createBoard({
  userId,
  image,
  name,
}: CreateBoardRequest & { userId: string }) {
  logger.info('Creando tablero', {
    userId,
    name,
  })
  const board: Omit<Board, 'id'> = {
    name,
    image: null,
  }

  if (image != null) {
    logger.info('Guardando imagen del tablero', {
      userId,
      name,
    })
    await fs.mkdir('uploads/board', { recursive: true })
    const imagePath = path.join(
      'uploads',
      'board',
      `${Date.now()}-${image.name}`,
    )
    const arrayBuffer = await image.arrayBuffer()
    try {
      await fs.writeFile(imagePath, Buffer.from(arrayBuffer), 'binary')
      logger.info('Imagen del tablero guardada', {
        userId,
        name,
        imagePath,
      })
      board.image = imagePath
    } catch (e) {
      logger.error(e, 'Error al guardar la imagen')
      throw new HTTPException(500, {
        message: 'Error al guardar la imagen',
      })
    }
  }

  const [insertedBoard] = await db.insert(boardTable).values(board).returning()
  const _ = await db.insert(userBoardTable).values({
    boardId: insertedBoard.id,
    userId,
    role: 'ADMIN',
  })

  logger.info('Tablero creado', {
    userId,
    name,
    boardId: insertedBoard.id,
  })
  return insertedBoard
}

async function deleteBoard({
  boardId,
  userId,
}: {
  boardId: string
  userId: string
}) {
  logger.info('Eliminando tablero', {
    userId,
    boardId,
  })
  const boardToDelete = await db.query.boardTable.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  })
  if (boardToDelete == null) {
    logger.error('Tablero para borrar no encontrar', {
      userId,
      boardId,
    })
    throw new HTTPException(404, {
      message: 'No se ha encontrado el tablero con id ' + boardId,
    })
  }
  const userBoard = await db.query.userBoardTable.findFirst({
    where: (ub, { and, eq }) =>
      and(eq(ub.boardId, boardId), eq(ub.userId, userId)),
  })

  if (userBoard == null || userBoard.role !== 'ADMIN') {
    logger.error('Usuario no tiene permisos para borrar el tablero', {
      userId,
      boardId,
    })
    throw new HTTPException(403, {
      message: 'No tienes permisos para eliminar este tablero',
    })
  }
  const columns = await db.query.columnTable.findMany({
    where: (column, { eq }) => eq(column.boardId, boardId),
  })
  const tags = await db.query.tagTable.findMany({
    where: (tag, { eq }) => eq(tag.boardId, boardId),
  })
  const columnIds = columns.map((c) => c.id)
  const tasks =
    columnIds.length > 0
      ? await db.query.taskTable.findMany({
          where: (task, { inArray }) => inArray(task.columnId, columnIds),
        })
      : []
  if (tasks.length > 0) {
    const taskIds = tasks.map((t) => t.id)
    await db
      .delete(taskTagTable)
      .where(inArray(taskTagTable.taskId, taskIds))
      .execute()
    await db
      .delete(userTaskTable)
      .where(inArray(userTaskTable.taskId, taskIds))
      .execute()
    await db.delete(taskTable).where(inArray(taskTable.id, taskIds)).execute()
  }
  if (tags.length > 0) {
    await db
      .delete(tagTable)
      .where(
        inArray(
          tagTable.id,
          tags.map((t) => t.id),
        ),
      )
      .execute()
  }
  if (columnIds.length > 0) {
    await db
      .delete(taskTable)
      .where(inArray(taskTable.columnId, columnIds))
      .execute()
  }
  await db.delete(columnTable).where(eq(columnTable.boardId, boardId)).execute()
  await db
    .delete(userBoardTable)
    .where(eq(userBoardTable.boardId, boardId))
    .execute()
  await db.delete(boardTable).where(eq(boardTable.id, boardId)).execute()
  logger.info('Tablero eliminado', {
    userId,
    boardId,
  })
  if (boardToDelete.image != null) {
    await fs.unlink(boardToDelete.image)
  }
}

export const boardService = {
  createBoard,
  getBoards,
  getBoard,
  getBoardImage,
  deleteBoard,
}
