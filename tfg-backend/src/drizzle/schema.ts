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
import { type InferSelectModel, relations } from 'drizzle-orm'

export const userBoardRole = pgEnum('UserBoardRole', ['ADMIN', 'USER'] as const)

export const userTable = pgTable(
  'User',
  {
    username: varchar('username', { length: 50 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    name: varchar('name', { length: 100 }).notNull().default(''),
    lastName: varchar('lastName', { length: 100 }).notNull().default(''),
    id: uuid('id').primaryKey().notNull().defaultRandom(),
  },
  (table) => {
    return {
      usernameKey: uniqueIndex('User_username_key').on(table.username),
    }
  },
)

export const boardTable = pgTable('Board', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull(),
  image: varchar('image', { length: 255 }),
})

export const columnTable = pgTable('Column', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  order: integer('order').notNull().default(0),
  boardId: uuid('boardId')
    .notNull()
    .references(() => boardTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
})

export const taskTable = pgTable('Task', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  columnId: uuid('columnId')
    .notNull()
    .references(() => columnTable.id, {
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
  order: integer('order').notNull().default(0),
})

export const tagTable = pgTable('Tag', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(),
  boardId: uuid('boardId')
    .notNull()
    .references(() => boardTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
})

// @ts-expect-error Somehow typescript is not able to infer the type of the parent column
export const commentTable = pgTable('Comment', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  text: text('text').notNull(),
  taskId: uuid('taskId')
    .notNull()
    .references(() => taskTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  userId: uuid('userId')
    .notNull()
    .references(() => userTable.id, {
      onDelete: 'restrict',
      onUpdate: 'cascade',
    }),
  parentId: uuid('parentId').references(() => commentTable.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade',
  }),
})

export const userTaskTable = pgTable(
  'UserTask',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    taskId: uuid('taskId')
      .notNull()
      .references(() => taskTable.id, {
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

export const taskTagTable = pgTable(
  'TaskTag',
  {
    taskId: uuid('taskId')
      .notNull()
      .references(() => taskTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    tagId: uuid('tagId')
      .notNull()
      .references(() => tagTable.id, {
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

export const userBoardTable = pgTable(
  'UserBoard',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => userTable.id, {
        onDelete: 'restrict',
        onUpdate: 'cascade',
      }),
    boardId: uuid('boardId')
      .notNull()
      .references(() => boardTable.id, {
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

export const boardRelations = relations(boardTable, ({ one, many }) => ({
  columns: many(columnTable),
  tag: many(tagTable),
  userBoard: many(userBoardTable),
}))

export const columnRelations = relations(columnTable, ({ one, many }) => ({
  board: one(boardTable, {
    fields: [columnTable.boardId],
    references: [boardTable.id],
  }),
  tasks: many(taskTable),
}))

export const taskRelations = relations(taskTable, ({ one, many }) => ({
  column: one(columnTable, {
    fields: [taskTable.columnId],
    references: [columnTable.id],
  }),
  comments: many(commentTable),
  taskTags: many(taskTagTable),
  userTasks: many(userTaskTable),
}))

export const tagRelations = relations(tagTable, ({ one, many }) => ({
  board: one(boardTable, {
    fields: [tagTable.boardId],
    references: [boardTable.id],
  }),
  taskTags: many(taskTagTable),
}))

export const commentRelations = relations(commentTable, ({ one, many }) => ({
  task: one(taskTable, {
    fields: [commentTable.taskId],
    references: [taskTable.id],
  }),
  user: one(userTable, {
    fields: [commentTable.userId],
    references: [userTable.id],
  }),
  parent: one(commentTable, {
    fields: [commentTable.parentId],
    references: [commentTable.id],
  }),
}))

export const userRelations = relations(userTable, ({ one, many }) => ({
  userBoards: many(userBoardTable),
  userTasks: many(userTaskTable),
  comments: many(commentTable),
}))

export const userBoardRelations = relations(
  userBoardTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [userBoardTable.userId],
      references: [userTable.id],
    }),
    board: one(boardTable, {
      fields: [userBoardTable.boardId],
      references: [boardTable.id],
    }),
  }),
)

export const userTaskRelations = relations(userTaskTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [userTaskTable.userId],
    references: [userTable.id],
  }),
  task: one(taskTable, {
    fields: [userTaskTable.taskId],
    references: [taskTable.id],
  }),
}))

export const taskTagRelations = relations(taskTagTable, ({ one, many }) => ({
  task: one(taskTable, {
    fields: [taskTagTable.taskId],
    references: [taskTable.id],
  }),
  tag: one(tagTable, {
    fields: [taskTagTable.tagId],
    references: [tagTable.id],
  }),
}))

export type User = InferSelectModel<typeof userTable>
export type Board = InferSelectModel<typeof boardTable>
export type Column = InferSelectModel<typeof columnTable>
export type Task = InferSelectModel<typeof taskTable>
export type Tag = InferSelectModel<typeof tagTable>
export type Comment = InferSelectModel<typeof commentTable>
export type UserTask = InferSelectModel<typeof userTaskTable>
export type TaskTag = InferSelectModel<typeof taskTagTable>
export type UserBoard = InferSelectModel<typeof userBoardTable>
export type UserBoardRole = (typeof userBoardRole.enumValues)[number]
