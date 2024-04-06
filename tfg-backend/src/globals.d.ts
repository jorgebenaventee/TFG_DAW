interface TaskResponse {
  id: string
  name: string
  description: string
  hasImage: boolean
  startDate: Date
  endDate: Date
  order: number
  assignedTo: string[]
  tags: string[]
}

interface ColumnResponse {
  id: string
  name: string
  order: number
  boardId: string
  tasks: TaskResponse[]
}
