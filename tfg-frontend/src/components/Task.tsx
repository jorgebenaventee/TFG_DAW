import { Task as TaskType } from '@/api/task-api.ts'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { cn } from '@/lib/utils.ts'

export function Task({ task }: { task: TaskType }) {
  const isEndDateBeforeToday =
    (task.endDate && new Date(task.endDate) < new Date()) ?? false
  return (
    <Card
      className={cn(
        isEndDateBeforeToday && 'bg-red-900',
        'flex-column flex h-full min-h-28 justify-center items-center',
      )}
    >
      <CardHeader className="flex-column flex h-full items-center justify-center">
        <CardTitle className="text-lg">{task.name}</CardTitle>
        {task.description && (
          <CardDescription
            className={cn(
              'truncate',
              isEndDateBeforeToday && 'text-neutral-300',
            )}
          >
            {task.description}
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}
