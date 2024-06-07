import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from 'dotenv'
import loginRouter from '@/routers/login.router'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { client } from '@/drizzle/db'
import boardRouter from '@/routers/board.router'
import columnRouter from '@/routers/column.router'
import { getLogger } from '@/utils/get-logger'
import taskRouter from '@/routers/task.router'
import userboardRouter from '@/routers/userboard.router'
import tagRouter from './routers/tag.router'
import * as process from 'node:process'

if (process.env.NODE_ENV !== 'test') {
  config()
} else {
  config({ path: './.env.test' })
}

const envVariables = z.object({
  JWT_SECRET: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.string(),
  OPENAI_KEY: z.string(),
  APP_PORT: z.string(),
})

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

const log = getLogger()
export const app = new Hono().basePath('/api')
app.use('*', cors())
app.use(logger())
app.route('/auth', loginRouter)
app.route('/board', boardRouter)
app.route('/column', columnRouter)
app.route('/task', taskRouter)
app.route('/userboard', userboardRouter)
app.route('/tag', tagRouter)
app.onError((e, { req }) => {
  const { method, url } = req
  log.error(e, 'Error in request', {
    method,
    url,
  })
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
  const port = Number(process.env.APP_PORT)
  console.log(`Server is running on port ${port}`)

  serve({
    fetch: app.fetch,
    port,
  })
})()
