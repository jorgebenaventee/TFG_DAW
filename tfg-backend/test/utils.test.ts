import { db } from '@/drizzle/db'
import {
  boardTable,
  columnTable,
  taskTable,
  userBoardTable,
  userTable,
} from '@/drizzle/schema'
import { Hono } from 'hono'
import { hash } from 'bcrypt'

export const TEST_USER = 'test'
export const TEST_PASSWORD = 'test'

export async function setupDb() {
  const password = await hash(TEST_PASSWORD, 10)
  const [user] = await db
    .insert(userTable)
    .values({
      username: TEST_USER,
      password,
    })
    .returning()
    .execute()
  const [board] = await db
    .insert(boardTable)
    .values({
      name: 'Test',
    })
    .returning()
    .execute()
  const [userBoard] = await db
    .insert(userBoardTable)
    .values({
      userId: user.id,
      boardId: board.id,
      role: 'ADMIN',
    })
    .returning()
    .execute()

  const [column] = await db
    .insert(columnTable)
    .values({
      name: 'Test',
      boardId: board.id,
      order: 0,
    })
    .returning()
    .execute()

  const [task] = await db
    .insert(taskTable)
    .values({
      name: 'Test',
      columnId: column.id,
      order: 0,
    })
    .returning()
    .execute()
}

export async function login(app: Hono) {
  const res = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: TEST_USER,
      password: TEST_PASSWORD,
    }),
  })
  const body = await res.json()
  return body.token
}
