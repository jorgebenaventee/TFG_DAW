import { getLogger } from '@/utils/get-logger'
import { userBoardService } from './userboard.service'
import { HTTPException } from 'hono/http-exception'
import { db } from '@/drizzle/db'
import { Tag, tagTable, taskTagTable } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'

const logger = getLogger()
async function checkPermissions({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  logger.info('Comprobando permisos en etiquetas', { userId, boardId })
  const role = await userBoardService.checkPermissions({ userId, boardId })
  logger.info('Permiso del usuario en tablero', { role, userId, boardId })
  if (!role) {
    throw new HTTPException(403, {
      message: 'No tienes permiso para ver las etiquetas de este tablero',
    })
  }

  return role
}

async function checkAdminPermissions({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  const role = await checkPermissions({ userId, boardId })
  if (role !== 'ADMIN') {
    throw new HTTPException(403, {
      message: 'No tienes permiso para modificar las etiquetas de este tablero',
    })
  }
}

async function insertTag({ userId, tag }: { userId: string; tag: Tag }) {
  logger.info('Insertando etiqueta', { userId, tag })
  await checkAdminPermissions({ userId, boardId: tag.boardId })
  return await db.insert(tagTable).values(tag).returning().execute()
}

async function updateTag({ userId, tag }: { userId: string; tag: Tag }) {
  logger.info('Actualizando etiqueta', { userId, tag })
  await checkAdminPermissions({ userId, boardId: tag.boardId })
  return await db
    .update(tagTable)
    .set(tag)
    .where(eq(tagTable.id, tag.id))
    .returning()
    .execute()
}

async function deleteTag({ userId, tagId }: { userId: string; tagId: string }) {
  logger.info('Borrando etiqueta', { userId, tagId })
  const tag = await db.query.tagTable.findFirst({
    where: (tag, { eq }) => eq(tag.id, tagId),
  })
  if (!tag) {
    throw new HTTPException(404, {
      message: 'No se ha encontrado la etiqueta',
    })
  }
  await checkAdminPermissions({ userId, boardId: tag.boardId })
  await db.delete(taskTagTable).where(eq(taskTagTable.tagId, tagId)).execute()
  return await db.delete(tagTable).where(eq(tagTable.id, tagId)).execute()
}

async function getTasksInBoard({
  userId,
  boardId,
}: {
  userId: string
  boardId: string
}) {
  await checkPermissions({ userId, boardId })
  return await db.query.tagTable.findMany({
    where: (tag, { eq }) => eq(tag.boardId, boardId),
  })
}

async function getTag({ userId, tagId }: { userId: string; tagId: string }) {
  const tag = await db.query.tagTable.findFirst({
    where: (tag, { eq }) => eq(tag.id, tagId),
  })
  if (!tag) {
    throw new HTTPException(404, {
      message: 'No se ha encontrado la etiqueta',
    })
  }
  const boardId = tag.boardId
  const role = await checkPermissions({ userId, boardId })
  if (!role) {
    throw new HTTPException(403, {
      message: 'No tienes permiso para ver esta etiqueta',
    })
  }
  return tag
}

export const tagService = {
  insertTag,
  updateTag,
  deleteTag,
  getTagsInBoard: getTasksInBoard,
  getTag,
}
