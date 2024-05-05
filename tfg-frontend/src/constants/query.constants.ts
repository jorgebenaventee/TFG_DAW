export const QUERY_KEYS = {
  BOARDS: ['boards'] as const,
  BOARD: ({ boardId }: { boardId: string }) => ['board', boardId] as const,
  COLUMNS: ({ boardId }: { boardId: string }) => ['columns', boardId] as const,
  USER_BOARD: ({ boardId }: { boardId: string }) =>
    ['user-board', boardId] as const,
} as const
