import { HTTPException } from 'hono/http-exception'
import { compare } from 'bcrypt'
import * as process from 'process'
import { SignJWT } from 'jose'
import { type LoginRequest } from '@/schemas/auth/loginRequest'
import { getLogger } from '@/utils/get-logger'
import { db } from '@/drizzle/db'
import { type User } from '@/drizzle/schema'

const logger = getLogger()

async function login({ username, password }: LoginRequest) {
  logger.info('Login attempt %o', { username })
  const dbUser = await db.query.userTable.findFirst({
    where: (user, { eq }) => eq(user.username, username),
  })
  if (dbUser == null) {
    logger.error('User not found %o', { username })
    throw new HTTPException(401, {
      message: 'Usuario o contraseña incorrectos',
    })
  }

  const passwordMatch = await compare(password, dbUser.password)
  if (!passwordMatch) {
    logger.error('Invalid password %o', { username })
    throw new HTTPException(401, {
      message: 'Usuario o contraseña incorrectos',
    })
  }
  logger.info('Login successful %o', { username })
  const token = await generateToken(dbUser)

  return { token }
}

async function generateToken(user: User) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const alg = 'HS512'
  const payload = {
    id: user.id,
  }

  const signer = new SignJWT(payload)

  return await signer
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setIssuer('taskify')
    .setExpirationTime('1h')
    .sign(secret)
}

export const userService = {
  login,
}
