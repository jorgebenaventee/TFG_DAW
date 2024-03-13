import { db } from './db'
import { user } from './schema'
import { hash } from 'bcrypt'

async function main() {
  console.log('Seeding database')
  const password = await hash('password', 10)
  const insertUserSql = db
    .insert(user)
    .values({
      username: 'jorge',
      password,
    })
    .getSQL()

  await db.execute(insertUserSql)
  console.log('Database seeded')
}

;(async () => {
  try {
    await main()
    console.log('Database seeded')
  } catch (e) {
    console.error('Error executing main function', e)
  }
})()
