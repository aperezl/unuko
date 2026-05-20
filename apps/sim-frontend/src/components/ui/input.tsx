import { cn, focusRing, disabled as disabledClasses } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  ref?: React.Ref<HTMLInputElement>
}

export function Input({ className, type, error, ref, disabled, ...props }: InputProps) {
  return (
    <div className="relative w-full">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
          focusRing,
          disabled && disabledClasses,
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
