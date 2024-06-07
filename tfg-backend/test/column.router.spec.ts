import { afterAll, assert, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { client, db } from '@/drizzle/db'
import { sql } from 'drizzle-orm'
import * as process from 'node:process'
import { login, setupDb } from './utils.test'
import { Hono } from 'hono'
import { taskTable } from '@/drizzle/schema'

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Column router', () => {
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

  it('should get all columns in a board', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request(`/api/column?boardId=${board}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const columns = await res.json()
    assert.isTrue(columns.length === 1)
    assert.isTrue(columns[0].name === 'Test')
  })

  it('should create a column', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const createdColumn = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(createdColumn?.name === 'Testing 2')
  })

  it('should not create a column with no name', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de la columna es obligatorio',
    )
  })

  it('should not create a column with no boardId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const column = await db.query.columnTable.findFirst()
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should edit a column', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const column2 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(column2?.name === 'Testing 2')
    const res2 = await app.request(`/api/column/${column2!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 3',
        boardId: board,
      }),
    })
    assert.isTrue(res2.status === 204)
    const column3 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(column3?.name === 'Testing 3')
  })

  it('should not edit a column with no name', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const column2 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(column2?.name === 'Testing 2')
    const res2 = await app.request(`/api/column/${column2!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board,
      }),
    })

    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de la columna es obligatorio',
    )
  })

  it('should not edit a column with no boardId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const column2 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(column2?.name === 'Testing 2')
    const res2 = await app.request(`/api/column/${column2!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 3',
      }),
    })
    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should delete a column', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const column2 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isTrue(column2?.name === 'Testing 2')
    const res2 = await app.request(`/api/column/${column2!.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    assert.isTrue(res2.status === 204)
  })

  it('should delete a column and all its tasks', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/column', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const column2 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    await db
      .insert(taskTable)
      .values({
        name: 'Testing',
        columnId: column2!.id,
        order: 0,
      })
      .execute()
    const res2 = await app.request(`/api/column/${column2!.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    assert.isTrue(res2.status === 204)
    const column3 = await db.query.columnTable.findFirst({
      where: (column, { eq }) => eq(column.id, id),
    })
    assert.isFalse(Boolean(column3))
    const tasks = await db.query.taskTable.findMany({
      where: (task, { eq }) => eq(task.columnId, column2!.id),
    })
    assert.isTrue(tasks.length === 0)
  })
})
