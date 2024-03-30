import { useEffect, useRef, useState } from 'react'
import { useCreateBoardForm } from '@/hooks/use-create-board-form.ts'
import { boardItemClassName } from '@/constants/board.constants.ts'
import { PlusIcon } from '@/components/icons/plus-icon.tsx'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Label } from '@/components/ui/label.tsx'
import { Input } from '@/components/ui/input.tsx'
import { Button } from '@/components/ui/button.tsx'

export function CreateBoardItem() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { createBoardForm } = useCreateBoardForm()
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowCreateForm(false)
      }
    }

    document.addEventListener('click', handleClick)
    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])
  return (
    <div
      ref={ref}
      className={`relative rounded bg-accent transition hover:scale-105 ${boardItemClassName}`}
      onClick={() => setShowCreateForm(true)}
    >
      {!showCreateForm && (
        <PlusIcon className="absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 transform text-accent-foreground" />
      )}{' '}
      <div className="absolute top-0 flex h-full w-full items-end rounded bg-secondary/75 px-2 py-3">
        {showCreateForm ? (
          <createBoardForm.Provider>
            <form
              className="flex w-full flex-col justify-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void createBoardForm.handleSubmit()
              }}
            >
              <createBoardForm.Field
                validatorAdapter={zodValidator}
                name="name"
                validators={{
                  onSubmit: z
                    .string()
                    .min(1, 'El nombre del tablero es requerido'),
                }}
              >
                {(field) => (
                  <Label className="flex flex-col gap-2">
                    Nombre del tablero
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <em className="text-red-500" role="alert">
                        {field.state.meta.errors.join(', ')}
                      </em>
                    ) : null}
                  </Label>
                )}
              </createBoardForm.Field>
              <createBoardForm.Field name="image">
                {(field) => (
                  <Label className="flex flex-col gap-2">
                    Imagen del tablero
                    <Input
                      type="file"
                      className="file:text-white"
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.files?.[0])}
                    />
                  </Label>
                )}
              </createBoardForm.Field>
              <Button>Crear</Button>
            </form>
          </createBoardForm.Provider>
        ) : (
          <h3 className="text-lg font-semibold">Crear tablero</h3>
        )}
      </div>
    </div>
  )
}
