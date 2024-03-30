import { ValidationError } from '@tanstack/react-form'

interface InputErrorsProps {
  field: {
    state: {
      meta: {
        errors: ValidationError[]
      }
    }
  }
}

export function InputErrors({ field }: InputErrorsProps) {
  return field.state.meta.errors ? (
    <em className="text-red-500" role="alert">
      {field.state.meta.errors.join(', ')}
    </em>
  ) : null
}
