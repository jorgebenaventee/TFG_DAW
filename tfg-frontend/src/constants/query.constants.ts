export const QUERY_KEYS = {
  BOARDS: ['boards'] as const,
  COLUMNS: ({ boardId }: { boardId: string }) => ['columns', boardId] as const,
} as const
