import { type CreateBoardRequest } from '@/schemas/boards/create-board.schema'
import { db } from '@/drizzle/db'
import { boardTable, userBoardTable } from '@/drizzle/schema'

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

export const boardService = {
  createBoard,
}
