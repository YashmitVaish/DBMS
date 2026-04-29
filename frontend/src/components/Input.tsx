import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
}

export default function Input({ label, hint, error, id, ...rest }: InputProps) {
  const describedBy =
    id && (hint || error)
      ? [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
          .filter(Boolean)
          .join(' ')
      : undefined

  return (
    <div className="field">
      {label ? (
        <label className="label" htmlFor={id}>
          {label}
        </label>
      ) : null}

      <input
        id={id}
        className="input"
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        {...rest}
      />

      {hint ? (
        <div id={`${id}-hint`} className="muted small">
          {hint}
        </div>
      ) : null}

      {error ? (
        <div id={`${id}-error`} className="error small">
          {error}
        </div>
      ) : null}
    </div>
  )
}
