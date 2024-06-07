import {
  afterAll,
  assert,
  beforeAll,
  beforeEach,
  describe,
  it,
  Mock,
  vi,
} from 'vitest'
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
import { taskService } from '@/services/task.service'

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Task router', () => {
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
    await vi.clearAllMocks()
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

  it('should create a task', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const task = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task?.name === 'Testing 2')
  })

  it('should not create a task with no name', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de la tarea es obligatorio',
    )
  })

  it('should not create a task with no columnId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        boardId: board?.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo columnId es requerido',
    )
  })

  it('should not create a task with no boardId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const column = await db.query.columnTable.findFirst()
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column?.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should move a task', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const task = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task?.name === 'Testing 2')
    const res2 = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: id,
        newColumnId: column.id,
        boardId: board,
        order: 0,
      }),
    })

    assert.isTrue(res2.status === 200)
    const task2 = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task2?.name === 'Testing 2')
    assert.isTrue(task2?.columnId === column.id)
    assert.isTrue(task2?.order === 0)
  })

  it('should not move a task with no taskId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        newColumnId: column.id,
        boardId: board,
        order: 0,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo taskId es requerido',
    )
  })

  it('should not move a task with no newColumnId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: column.id,
        boardId: board,
        order: 0,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo newColumnId es requerido',
    )
  })

  it('should not move a task with no boardId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: column.id,
        newColumnId: column.id,
        order: 0,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should not move a task with no order', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: column.id,
        newColumnId: column.id,
        boardId: board,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo order es requerido',
    )
  })

  it('should not move a task with invalid id', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    let taskId = crypto.randomUUID()
    const res = await app.request('/api/task/move', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        taskId: taskId,
        newColumnId: column.id,
        boardId: board,
        order: 0,
      }),
    })

    assert.isTrue(res.status === 404)
    const body = await res.json()
    assert.isTrue(body.message === `La tarea con id ${taskId} no existe`)
  })

  it('should edit a task', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
        description: 'Testing',
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const task = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task?.name === 'Testing 2')
    const res2 = await app.request(`/api/task/${task!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...task,
        boardId: board,
        name: 'Testing 3',
      }),
    })
    assert.isTrue(res2.status === 200)
    const task2 = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task2?.name === 'Testing 3')
  })

  it('should not edit a task with no boardId', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
        description: 'Testing',
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const task = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task?.name === 'Testing 2')
    const res2 = await app.request(`/api/task/${task!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...task,
        name: 'Testing 3',
      }),
    })
    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should not edit a task with no name', async () => {
    const token = await login(app)
    const [user] = await db.query.userTable.findMany()
    const [column] = await db.query.columnTable.findMany()
    const board = column.boardId
    const res = await app.request('/api/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        assignedTo: [user.id],
        columnId: column.id,
        boardId: board,
        description: 'Testing',
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const task = await db.query.taskTable.findFirst({
      where: (task, { eq }) => eq(task.id, id),
    })
    assert.isTrue(task?.name === 'Testing 2')
    const res2 = await app.request(`/api/task/${task!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...task,
        boardId: board,
        name: undefined,
      }),
    })
    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(body.error.issues[0].message === 'El campo name es requerido')
  })

  it('should generate a description', async () => {
    taskService.generateDescription = vi.fn().mockResolvedValue('Testing')

    const token = await login(app)
    const res = await app.request('/api/task/ai/description?title=Testing', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const body = await res.json()
    assert.isTrue(body.description === 'Testing')
    assert.isTrue(res.status === 200)
    assert.isTrue(
      (taskService.generateDescription as Mock).mock.calls.length === 1,
    )
    assert.isTrue(
      (taskService.generateDescription as Mock).mock.calls[0][0].title ===
        'Testing',
    )
    vi.clearAllMocks()
  })
})
