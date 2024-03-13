import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { configDotenv } from 'dotenv'
import loginRouter from '@/routers/login.router'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'
import { cors } from 'hono/cors'
import { jwt } from 'hono/jwt'
import {logger} from 'hono/logger'

configDotenv()

const envVariables = z.object({
  JWT_SECRET: z.string(),
})

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {
    }
  }
}

const app = new Hono().basePath('/api')
app.use('*', cors())
app.use(logger())
app.route('/auth', loginRouter)
app.use('*', jwt({ secret: process.env.JWT_SECRET }))
app.onError((e) => {
  if (e instanceof HTTPException) {
    const json = {
      status: e.status,
      message: e.message,
    }
    return new Response(JSON.stringify(json), {
      status: e.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({
    status: 500,
    message: 'Internal server error',
  }), { status: 500 })
})

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
