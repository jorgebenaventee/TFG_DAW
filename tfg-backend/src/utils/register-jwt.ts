import { jwt } from 'hono/jwt'

export function registerJwt() {
  return jwt({
    secret: process.env.JWT_SECRET,
    alg: 'HS512',
  })
}
