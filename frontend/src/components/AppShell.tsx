import type { ReactNode } from 'react'

type AppShellProps = {
  title?: ReactNode
  nav?: ReactNode
  children: ReactNode
}

export default function AppShell({ title, nav, children }: AppShellProps) {
  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="container appHeaderInner">
          <div className="appTitle">{title}</div>
          <nav className="appNav" aria-label="Primary">
            {nav}
          </nav>
        </div>
      </header>

      <main className="container appMain">{children}</main>

      <footer className="appFooter">
        <div className="container">
          <span className="muted">University Portal</span>
        </div>
      </footer>
    </div>
  )
}
