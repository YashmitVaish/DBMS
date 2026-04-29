import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

export default function Button({
  variant = 'primary',
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const variantClass = variant === 'primary' ? 'btnPrimary' : 'btnSecondary'

  return (
    <button
      type={type}
      className={["btn", variantClass, className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
