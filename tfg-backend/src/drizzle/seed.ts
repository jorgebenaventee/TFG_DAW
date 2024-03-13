import { db } from './db'
import { userTable } from './schema'
import { hash } from 'bcrypt'

async function main() {
  console.log('Seeding database')
  const password = await hash('password', 10)
  await db.insert(userTable).values({
    username: 'jorge',
    password,
  })

  console.log('Database seeded')
}

;(async () => {
  try {
    await main()
  } catch (e) {
    console.error('Error executing main function', e)
  }
})()
