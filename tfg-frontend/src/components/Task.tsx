import { Task as TaskType } from '@/api/task-api.ts'
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx'
import { cn } from '@/lib/utils.ts'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'

export function Task({ task }: { task: TaskType }) {
  const isEndDateBeforeToday =
    (task.endDate && new Date(task.endDate) < new Date()) ?? false
  return (
    <Card
      className={cn(
        isEndDateBeforeToday && 'bg-red-900',
        'flex h-full min-h-28 flex-col items-center justify-center',
      )}
    >
      <CardHeader className="flex h-full flex-col items-center justify-center">
        <CardTitle className="text-lg">{task.name}</CardTitle>
      </CardHeader>
      <CardFooter className="flex w-full items-end justify-end">
        {task.tags && (
          <div className="flex gap-2">
            {task.tags.map((tag) => (
              <TooltipProvider key={tag.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={cn('size-6 rounded-full')}
                      style={{ backgroundColor: tag.color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-bold">{tag.name}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
