import { PrismaClient, type User } from '@prisma/client'
import { HTTPException } from 'hono/http-exception'
import { compare } from 'bcrypt'
import * as process from 'process'
import { SignJWT } from 'jose'
import { type LoginSchema } from '@/schemas/login.schema'

const prisma = new PrismaClient()

async function login({
  username,
  password,
}: LoginSchema) {
  const user = await prisma.user.findUnique({
    where: { username },
  })
  if (user == null) {
    throw new HTTPException(401, { message: 'Usuario o contraseña incorrectos' })
  }

  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) {
    throw new HTTPException(401, { message: 'Usuario o contraseña incorrectos' })
  }
  const token = await generateToken(user)

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
