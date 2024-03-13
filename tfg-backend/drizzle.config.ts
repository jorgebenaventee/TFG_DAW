import 'dotenv/config'
import type { Config } from 'drizzle-kit'

const {
  POSTGRES_DB,
  POSTGRES_HOST,
  POSTGRES_PASSWORD,
  POSTGRES_PORT,
  POSTGRES_USER,
} = process.env
const drizzleConfig: Config = {
  driver: 'pg',
  out: './src/drizzle',
  schema: './src/drizzle/schema.ts',
  dbCredentials: {
    database: POSTGRES_DB,
    host: POSTGRES_HOST,
    password: POSTGRES_PASSWORD,
    port: Number(POSTGRES_PORT),
    user: POSTGRES_USER,
  },
  verbose: true,
  strict: true,
}

export default drizzleConfig
