import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/productos', label: 'Productos' },
  { href: '/tendencias', label: 'Tendencias' },
  { href: '/configuracion', label: 'Configuración' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-muted/40 flex flex-col">
        <div className="px-6 py-5">
          <h1 className="text-base font-semibold leading-tight">
            Monitor de Precios
            <span className="block text-xs font-normal text-muted-foreground">
              Bolivia
            </span>
          </h1>
        </div>
        <Separator />
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 text-xs text-muted-foreground">
          v1.0.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
