import { type CreateBoardRequest } from '@/schemas/boards/create-board.schema'
import { db } from '@/drizzle/db'
import { boardTable, userBoardTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import { HTTPException } from 'hono/http-exception'

async function getBoards({ userId }: { userId: string }) {
  const userBoards = await db.query.userBoardTable.findMany({
    where: (userBoard, { eq }) => eq(userBoard.userId, userId),
    columns: {
      boardId: true,
    },
  })

  return await db.query.boardTable.findMany({
    where: (board, { inArray }) =>
      inArray(
        board.id,
        userBoards.map((ub) => ub.boardId),
      ),
  })
}

async function createBoard({
  userId,
  name,
}: CreateBoardRequest & { userId: string }) {
  const [board] = await db.insert(boardTable).values({ name }).returning()
  const _ = await db.insert(userBoardTable).values({
    boardId: board.id,
    userId,
    role: 'ADMIN',
  })

  return board
}

async function deleteBoard({
  boardId,
  userId,
}: {
  boardId: string
  userId: string
}) {
  const boardToDelete = await db.query.boardTable.findFirst({
    where: (board, { eq }) => eq(board.id, boardId),
  })
  if (boardToDelete == null) {
    throw new HTTPException(404, {
      message: 'No se ha encontrado el tablero con id ' + boardId,
    })
  }
  const userBoard = await db.query.userBoardTable.findFirst({
    where: (ub, { and, eq }) =>
      and(eq(ub.boardId, boardId), eq(ub.userId, userId)),
  })

  if (userBoard == null || userBoard.role !== 'ADMIN') {
    throw new HTTPException(403, {
      message: 'No tienes permisos para eliminar este tablero',
    })
  }
  await db.delete(userBoardTable).where(eq(userBoardTable.boardId, boardId))
  await db.delete(boardTable).where(eq(boardTable.id, boardId))
}

export const boardService = {
  createBoard,
  getBoards,
  deleteBoard,
}
