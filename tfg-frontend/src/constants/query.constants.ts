export const QUERY_KEYS = {
  BOARDS: ['boards'] as const,
  BOARD: ({ boardId }: { boardId: string }) => ['board', boardId] as const,
  COLUMNS: ({ boardId }: { boardId: string }) => ['columns', boardId] as const,
  USER_BOARD: ({ boardId }: { boardId: string }) =>
    ['user-board', boardId] as const,
  TAGS: ({ boardId }: { boardId: string }) => ['tags', boardId] as const,
  TAG: ({ tagId }: { tagId: string }) => ['tag', tagId] as const,
} as const
