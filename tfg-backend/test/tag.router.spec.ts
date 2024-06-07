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

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Tag router', () => {
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

  it('should return all tags in board', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request(`/api/tag?boardId=${board!.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 200)
    const tags = await res.json()
    assert.isTrue(tags.length === 1)
    assert.isTrue(tags[0].name === 'Test')
  })

  it('should return tag by id', async () => {
    const token = await login(app)
    const tag = await db.query.tagTable.findFirst()
    const res = await app.request(`/api/tag/${tag!.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const tags = await res.json()
    assert.isTrue(res.status === 200)
    assert.isTrue(tags.name === 'Test')
  })

  it('should not return tag by id with invalid id', async () => {
    const token = await login(app)
    const res = await app.request(`/api/tag/${crypto.randomUUID()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    assert.isTrue(res.status === 404)
    const body = await res.json()
    assert.isTrue(body.message === 'No se ha encontrado la etiqueta')
  })

  it('should create a tag', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
  })

  it('should not create a tag with no name', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
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
      body.error.issues[0].message ===
        'El nombre de la etiqueta es obligatorio',
    )
  })

  it('should not create a tag with no boardId', async () => {
    const token = await login(app)
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#123456',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El campo boardId es requerido',
    )
  })

  it('should not create a tag with no color', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message ===
        'El color debe estar en formato hexadecimal',
    )
  })

  it('should not create a tag with invalid color', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: 'jejejeje',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message ===
        'El color debe estar en formato hexadecimal',
    )
  })

  it('should update a tag', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
    const res2 = await app.request(`/api/tag/${tag!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 3',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })
    assert.isTrue(res2.status === 200)
    const tag2 = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag2?.name === 'Testing 3')
  })

  it('should not update a tag with no name', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
    const res2 = await app.request(`/api/tag/${tag!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        boardId: board!.id,
      }),
    })
    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(
      body.error.issues[0].message ===
        'El nombre de la etiqueta es obligatorio',
    )
  })

  it('should not update a tag with no color', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
    const res2 = await app.request(`/api/tag/${tag!.id}`, {
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
      body.error.issues[0].message ===
        'El color debe estar en formato hexadecimal',
    )
  })

  it('should not update a tag with invalid color', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
    const res2 = await app.request(`/api/tag/${tag!.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 3',
        color: 'jejejeje',
        boardId: board!.id,
      }),
    })
    assert.isTrue(res2.status === 400)
    const body = await res2.json()
    assert.isTrue(
      body.error.issues[0].message ===
        'El color debe estar en formato hexadecimal',
    )
  })

  it('should delete a tag', async () => {
    const token = await login(app)
    const board = await db.query.boardTable.findFirst()
    const res = await app.request('/api/tag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Testing 2',
        color: '#ffffff',
        boardId: board!.id,
      }),
    })

    assert.isTrue(res.status === 201)
    const { id } = await res.json()
    const tag = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isTrue(tag?.name === 'Testing 2')
    const res2 = await app.request(`/api/tag/${tag!.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    assert.isTrue(res2.status === 204)
    const tag2 = await db.query.tagTable.findFirst({
      where: (tag, { eq }) => eq(tag.id, id),
    })
    assert.isFalse(Boolean(tag2))
  })
})
