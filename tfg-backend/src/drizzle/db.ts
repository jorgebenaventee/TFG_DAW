import 'dotenv/config'
import { Client } from 'pg'
import * as process from 'process'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

const {
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PORT,
} = process.env
export const client = new Client({
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
})

export const db = drizzle(client, { schema })
