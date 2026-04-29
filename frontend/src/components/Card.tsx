import type { HTMLAttributes, ReactNode } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode
}

export default function Card({ title, className, children, ...rest }: CardProps) {
  return (
    <div className={["card", className].filter(Boolean).join(' ')} {...rest}>
      {title ? <div className="cardTitle">{title}</div> : null}
      {children}
    </div>
  )
}
