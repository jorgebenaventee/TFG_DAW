import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { configDotenv } from 'dotenv'
import loginRouter from '@/routers/login.router'
import { z } from 'zod'
import { HTTPException } from 'hono/http-exception'

configDotenv()

const envVariables = z.object({
  JWT_SECRET: z.string(),
})

envVariables.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

const app = new Hono().basePath('/api')

app.route('/auth', loginRouter)

app.onError((e) => {
  if (e instanceof HTTPException) {
    const json = { status: e.status, message: e.message }
    return new Response(JSON.stringify(json), {
      status: e.status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response('Internal Server Error', { status: 500 })
})

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
