import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations, sql } from 'drizzle-orm'

export const userBoardRole = pgEnum('UserBoardRole', ['ADMIN', 'USER'])

export const user = pgTable(
  'User',
  {
    username: varchar('username', { length: 50 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    id: uuid('id').primaryKey().notNull().defaultRandom(),
  },
  (table) => {
    return {
      usernameKey: uniqueIndex('User_username_key').on(table.username),
    }
  },
)

export const board = pgTable('Board', {
  id: uuid('id').primaryKey().notNull(),
  name: varchar('name', { length: 50 }).notNull(),
})

export const column = pgTable('Column', {
  id: uuid('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  boardId: uuid('boardId')
    .notNull()
    .references(() => board.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
})

export const task = pgTable('Task', {
  id: uuid('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  columnId: uuid('columnId')
    .notNull()
    .references(() => column.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  imagePath: varchar('imagePath', { length: 255 }),
  startDate: timestamp('startDate', {
    withTimezone: true,
    mode: 'string',
  }),
  endDate: timestamp('endDate', {
    withTimezone: true,
    mode: 'string',
  }),
})

export const tag = pgTable('Tag', {
  id: uuid('id').primaryKey().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  boardId: uuid('boardId')
    .notNull()
    .references(() => board.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
})

export const comment = pgTable('Comment', {
  id: uuid('id').primaryKey().notNull(),
  text: text('text').notNull(),
  taskId: uuid('taskId')
    .notNull()
    .references(() => task.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
})

export const userTask = pgTable(
  'UserTask',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    taskId: uuid('taskId')
      .notNull()
      .references(() => task.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      userTaskPkey: primaryKey({
        columns: [table.userId, table.taskId],
        name: 'UserTask_pkey',
      }),
    }
  },
)

export const taskTag = pgTable(
  'TaskTag',
  {
    taskId: uuid('taskId')
      .notNull()
      .references(() => task.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    tagId: uuid('tagId')
      .notNull()
      .references(() => tag.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
  },
  (table) => {
    return {
      taskTagPkey: primaryKey({
        columns: [table.taskId, table.tagId],
        name: 'TaskTag_pkey',
      }),
    }
  },
)

export const userBoard = pgTable(
  'UserBoard',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    boardId: uuid('boardId')
      .notNull()
      .references(() => board.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    role: userBoardRole('role').default('USER').notNull(),
  },
  (table) => {
    return {
      userBoardPkey: primaryKey({
        columns: [table.userId, table.boardId],
        name: 'UserBoard_pkey',
      }),
    }
  },
)

// add relations

export const boardRelations = relations(board, ({ one, many }) => ({
  columns: many(column),
  tag: many(tag),
  userBoard: many(userBoard),
}))

export const columnRelations = relations(column, ({ one, many }) => ({
  board: one(board, { fields: [column.boardId], references: [board.id] }),
  tasks: many(task),
}))

export const taskRelations = relations(task, ({ one, many }) => ({
  column: one(column, { fields: [task.columnId], references: [column.id] }),
  comments: many(comment),
  taskTags: many(taskTag),
  userTasks: many(userTask),
}))

export const tagRelations = relations(tag, ({ one, many }) => ({
  board: one(board, { fields: [tag.boardId], references: [board.id] }),
  taskTags: many(taskTag),
}))

export const commentRelations = relations(comment, ({ one, many }) => ({
  task: one(task, { fields: [comment.taskId], references: [task.id] }),
  user: one(user, { fields: [comment.userId], references: [user.id] }),
}))

export const userRelations = relations(user, ({ one, many }) => ({
  userBoards: many(userBoard),
  userTasks: many(userTask),
  comments: many(comment),
}))

export const userBoardRelations = relations(userBoard, ({ one, many }) => ({
  user: one(user, { fields: [userBoard.userId], references: [user.id] }),
  board: one(board, { fields: [userBoard.boardId], references: [board.id] }),
}))

export const userTaskRelations = relations(userTask, ({ one, many }) => ({
  user: one(user, { fields: [userTask.userId], references: [user.id] }),
  task: one(task, { fields: [userTask.taskId], references: [task.id] }),
}))

export const taskTagRelations = relations(taskTag, ({ one, many }) => ({
  task: one(task, { fields: [taskTag.taskId], references: [task.id] }),
  tag: one(tag, { fields: [taskTag.tagId], references: [tag.id] }),
}))
