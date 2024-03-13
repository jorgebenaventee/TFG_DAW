import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { configDotenv } from 'dotenv'
import loginRouter from '@/routers/login.router'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import { logger } from 'hono/logger'
import { client, db } from '@/drizzle/db'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import * as path from 'path'
import { hash } from 'bcrypt'
import { userTable } from '@/drizzle/schema'
import boardRouter from '@/routers/board.router'

configDotenv()

const envVariables = z.object({
  JWT_SECRET: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
})

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

const app = new Hono().basePath('/api')
app.use('*', cors())
app.use(logger())
app.route('/auth', loginRouter)
app.use('*', jwt({ secret: process.env.JWT_SECRET, alg: 'HS512' }))
app.route('/board', boardRouter)
app.onError((e) => {
  if (e instanceof HTTPException) {
    const json = {
      status: e.status,
      message: e.message,
    }
    if (json.status === 401) {
      json.message ||= 'No autorizado'
    }
    return new Response(JSON.stringify(json), {
      status: e.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(
    JSON.stringify({
      status: 500,
      message: 'Internal server error',
    }),
    { status: 500 },
  )
})
;(async () => {
  await client.connect()
  await migrate(db, { migrationsFolder: path.resolve(__dirname, './drizzle') })
  // if (true) {
  //   await db.insert(user).values({
  //     username: 'jorge',
  //     password: await hash('password', 10),
  //   })
  // }
  const port = 5000
  console.log(`Server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
})()
