import { afterAll, assert, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { client, db } from '@/drizzle/db'
import { eq, sql } from 'drizzle-orm'
import * as process from 'node:process'
import { login, setupDb } from './utils.test'
import { Hono } from 'hono'
import { userBoardTable, userTable } from '@/drizzle/schema'
import * as fs from 'node:fs/promises'

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Board router', () => {
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

  it('should get all boards for user', async () => {
    const token = await login(app)
    const res = await app.request('/api/board', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const boards = await res.json()
    assert.isTrue(boards.length === 1)
    assert.isTrue(boards[0].name === 'Test')
  })

  it('should return all boards if user is super admin', async () => {
    const token = await login(app)
    const user = await db.query.userTable.findFirst()
    await db
      .update(userTable)
      .set({ isSuperAdmin: true })
      .where(eq(userTable.id, user!.id))
      .execute()
    const res = await app.request('/api/board', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const boards = await res.json()
    assert.isTrue(boards.length === 1)
    assert.isTrue(boards[0].name === 'Test')
  })

  it('should get a board', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [board] = await db.query.boardTable.findMany()
    const res = await app.request(`/api/board/${board.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const boardVm = await res.json()
    assert.isTrue(boardVm.name === 'Test')
    assert.isTrue(boardVm.isAdmin === true)
  })

  it('should not get a board if user does not have access', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [board] = await db.query.boardTable.findMany()
    await db
      .delete(userBoardTable)
      .where(eq(userBoardTable.userId, user!.id))
      .execute()
    const res = await app.request(`/api/board/${board.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 403)
    const body = await res.json()
    assert.isTrue(body.message === 'No tienes permiso para ver este tablero')
  })

  it('should create a board', async () => {
    const token = await login(app)
    const formData = new FormData()
    formData.append('name', 'Testing 2')
    const res = await app.request('/api/board', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const createdBoard = await db.query.boardTable.findFirst({
      where: (board, { eq }) => eq(board.id, id),
    })
    assert.isTrue(createdBoard?.name === 'Testing 2')
  })

  it('should create a board with an image', async () => {
    const token = await login(app)
    const fakeImage = await fs.readFile('test/images/test.jpg')
    const formData = new FormData()
    formData.append(
      'image',
      new File([fakeImage], 'test.jpg', { type: 'image/jpeg' }),
    )
    formData.append('name', 'Testing 2')
    const res = await app.request(`/api/board`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const createdBoard = await db.query.boardTable.findFirst({
      where: (board, { eq }) => eq(board.id, id),
    })
    assert.isTrue(createdBoard!.name === 'Testing 2')
    assert.isTrue(Boolean(await fs.stat(createdBoard!.image!)))

    await fs.unlink(createdBoard!.image!)
  })

  it('should not create a board with an invalid image', async () => {
    const token = await login(app)
    const fakeImage = await fs.readFile('test/images/test.jpg')
    const formData = new FormData()
    formData.append(
      'image',
      new File([fakeImage], 'test.jpg', { type: 'text/csv' }),
    )
    formData.append('name', 'Testing 2')
    const res = await app.request(`/api/board`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El archivo debe ser una imagen',
    )
  })

  it('should delete a board', async () => {
    const token = await login(app)
    const [board] = await db.query.boardTable.findMany()
    const res = await app.request(`/api/board/${board.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const board2 = await db.query.boardTable.findFirst({
      where: (board, { eq }) => eq(board.id, board.id),
    })
    assert.isFalse(Boolean(board2))
  })

  it('should not delete an invalid board', async () => {
    const token = await login(app)
    const uuid = crypto.randomUUID()
    const res = await app.request(`/api/board/${uuid}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 404)
    const body = await res.json()
    assert.isTrue(
      body.message === `No se ha encontrado el tablero con id ${uuid}`,
    )
  })
})
