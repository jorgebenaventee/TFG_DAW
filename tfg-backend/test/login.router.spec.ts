import { afterAll, assert, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { client, db } from '@/drizzle/db'
import { sql } from 'drizzle-orm'
import * as process from 'node:process'
import { setupDb, TEST_PASSWORD, TEST_USER } from './utils.test'
import { Hono } from 'hono'

const randomPort = Math.floor(Math.random() * (65535 - 1024) + 1024)
process.env.APP_PORT = randomPort.toString()

describe('Login router', () => {
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

  it('should return token for valid credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: TEST_USER,
        password: TEST_PASSWORD,
      }),
    })

    assert.isTrue(res.status === 200)
    const body = await res.json()
    assert.isTrue(Boolean(body.token))
  })

  it('should return 401 for invalid credentials', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test',
        password: 'im invalid :)',
      }),
    })

    assert.isTrue(res.status === 401)
  })

  it('should return 400 for missing password', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'test',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(body.error.issues[0].message === 'La contraseña es requerida')
  })

  it('should return 400 for missing username', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'test',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de usuario es requerido',
    )
  })

  it('should register a new user', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'newuser',
        password: 'test',
      }),
    })

    assert.isTrue(res.status === 201)
    const body = await res.json()
    assert.isTrue(Boolean(body.token))
  })

  it('should not register a new user with no username', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'test',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(
      body.error.issues[0].message === 'El nombre de usuario es requerido',
    )
  })

  it('should not register a new user with no password', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'newuser',
      }),
    })

    assert.isTrue(res.status === 400)
    const body = await res.json()
    assert.isTrue(body.error.issues[0].message === 'La contraseña es requerida')
  })
})
