import { Task as TaskType } from '@/api/task-api.ts'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { cn } from '@/lib/utils.ts'

const dateIntl = new Intl.DateTimeFormat('es-ES', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

export function Task({ task }: { task: TaskType }) {
  const isEndDateBeforeToday =
    task.endDate && new Date(task.endDate) < new Date()
  return (
    <Card className={cn(isEndDateBeforeToday && 'bg-red-900')}>
      <CardHeader>
        <CardTitle className="text-lg">{task.name}</CardTitle>
        {task.description && (
          <CardDescription className="truncate">
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}
