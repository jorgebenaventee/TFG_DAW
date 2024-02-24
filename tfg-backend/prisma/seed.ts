import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prismaClient = new PrismaClient()

const password = await bcrypt.hash('password', 10)
await prismaClient.user.create({
  data: {
    username: 'jorge',
    password,
  },
})
