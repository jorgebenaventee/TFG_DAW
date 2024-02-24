import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { configDotenv } from 'dotenv'

configDotenv()

const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port,
})
