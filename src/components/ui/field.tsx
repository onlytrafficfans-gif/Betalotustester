/**
 * Field Component
 * 
 * Provides consistent form field layouts with label, input, description,
 * and error message support. Composes with existing shadcn/ui components.
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function Field({
  label,
  description,
  error,
  required,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label && (
        <Label className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {children}
      {description && !error && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, description, error, required, className, ...props }, ref) => {
    return (
      <Field
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      >
        <Input
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${props.id}-error` : description ? `${props.id}-desc` : undefined
          }
          {...props}
        />
      </Field>
    )
  }
)
InputField.displayName = "InputField"

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, description, error, required, className, ...props }, ref) => {
    return (
      <Field
        label={label}
        description={description}
        error={error}
        required={required}
        className={className}
      >
        <Textarea
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={
            error ? `${props.id}-error` : description ? `${props.id}-desc` : undefined
          }
          {...props}
        />
      </Field>
    )
  }
)
TextareaField.displayName = "TextareaField"

export { Field, InputField, TextareaField }
