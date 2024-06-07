import { afterAll, assert, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { client, db } from '@/drizzle/db'
import { sql } from 'drizzle-orm'
import * as process from 'node:process'
import { login, setupDb, TEST_USER } from './utils.test'
import { Hono } from 'hono'
import { userBoardTable, userTable } from '@/drizzle/schema'

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Userboard router', () => {
  let postgresContainer: StartedPostgreSqlContainer
  let app: Hono
  beforeAll(async (context) => {
    postgresContainer = await new PostgreSqlContainer()
      .withUsername(process.env.POSTGRES_USER)
      .withPassword(process.env.POSTGRES_PASSWORD)
      .withDatabase(process.env.POSTGRES_DB)
      .withExposedPorts({
        host: Number(process.env.POSTGRES_PORT),
        container: 5432,
      })
      .start()
    process.env.POSTGRES_DB = postgresContainer.getDatabase()
    process.env.POSTGRES_HOST = postgresContainer.getHost()
    process.env.POSTGRES_PORT = postgresContainer.getMappedPort(5432).toString()
    process.env.POSTGRES_USER = postgresContainer.getUsername()
    process.env.POSTGRES_PASSWORD = postgresContainer.getPassword()
    client.host = process.env.POSTGRES_HOST
    client.port = Number(process.env.POSTGRES_PORT)
    client.user = process.env.POSTGRES_USER
    client.password = process.env.POSTGRES_PASSWORD
    client.database = process.env.POSTGRES_DB
    app = (await import('../src/index')).app
  })

  beforeEach(async (context) => {
    await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE;`)
    await db.execute(sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`)
    await db.execute(sql`CREATE SCHEMA public;`)
    console.log('Dropped and created schema')
    await migrate(db, { migrationsFolder: './src/drizzle' })
    console.log('Migrated')
    await setupDb()
    console.log('Setup db')
  })

  afterAll(async () => {
    await client.end()
    await postgresContainer.stop()
  })

  it('should get all users in a board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request(`/api/userboard/${board!.id}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const users = await res.json()
    assert.isTrue(users.length === 1)
    assert.isTrue(users[0].username === TEST_USER)
  })

  it('should add user to board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const [newUser] = await db
      .insert(userTable)
      .values({
        username: 'hola',
        password: 'test',
      })
      .returning()
      .execute()
    const res = await app.request('/api/userboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newUser.username,
        boardId: board!.id,
        role: 'USER',
      }),
    })

    assert.isTrue(res.status === 201)
    const user = await db.query.userBoardTable.findFirst({
      where: (userBoard, { eq, and }) =>
        and(eq(userBoard.userId, newUser.id), eq(userBoard.boardId, board!.id)),
    })
    assert.isTrue(user?.role === 'USER')
  })

  it('should not add user to board with no role', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const [newUser] = await db
      .insert(userTable)
      .values({
        username: 'hola',
        password: 'test',
      })
      .returning()
      .execute()
    const res = await app.request('/api/userboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newUser.username,
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El rol solo puede ser ADMIN o USER',
    )
  })

  it('should not add user to board with no username', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/userboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de usuario es obligatorio',
    )
  })

  it('should not add user to board with no boardId', async () => {
    const token = await login(app)
    const [newUser] = await db
      .insert(userTable)
      .values({
        username: 'hola',
        password: 'test',
      })
      .returning()
      .execute()
    const res = await app.request('/api/userboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: newUser.username,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should not add existing user to board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/userboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: TEST_USER,
        boardId: board!.id,
        role: 'USER',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(body.message === 'Ese usuario ya pertenece al tablero')
  })

  it('should delete user from board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const [newUser] = await db
      .insert(userTable)
      .values({
        username: 'hola',
        password: 'test',
      })
      .returning()
      .execute()

    const [userBoard] = await db
      .insert(userBoardTable)
      .values({
        userId: newUser.id,
        boardId: board!.id,
        role: 'USER',
      })
      .returning()
      .execute()
    const res = await app.request('/api/userboard', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: newUser.id,
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 204)
  })

  it('should not delete user from board with no userId', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/userboard', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo userId es requerido',
    )
  })

  it('should not delete user from board with no boardId', async () => {
    const token = await login(app)
    const [newUser] = await db
      .insert(userTable)
      .values({
        username: 'hola',
        password: 'test',
      })
      .returning()
      .execute()
    const res = await app.request('/api/userboard', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: newUser.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should not delete non-existent user from board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/userboard', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: crypto.randomUUID(),
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 404)
    const body = await res.json()
    assert.isTrue(
      body.message ===
        'No se ha encontrado el usuario a eliminar en el tablero',
    )
  })
})
