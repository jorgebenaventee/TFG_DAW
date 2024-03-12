import { createFileRoute } from '@tanstack/react-router'
import { checkAuth } from '@/utils/auth.ts'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: checkAuth,
})
