'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  // LayoutDashboard,
  // Wallet,
  // PieChart,
  // ArrowRight,
  // Bot,
  // TrendingUp,
  // Settings,
  // ChevronLeft,
  // ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    // icon: LayoutDashboard,
    emoji: "📊"
  },
  {
    name: 'Cuentas',
    href: '/accounts',
    // icon: Wallet,
    emoji: "💰"
  },
  {
    name: 'Presupuestos',
    href: '/budgets',
    // icon: PieChart,
    emoji: "💳"
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    // icon: ArrowRight,
    emoji: "💸"
  },
  {
    name: 'Asesor IA',
    href: '/advisor',
    // icon: Bot,
    emoji: "🤖"
  },
  {
    name: 'Proyecciones',
    href: '/projections',
    // icon: TrendingUp,
    emoji: "📈"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 z-50 h-full',
        collapsed ? 'w-16' : 'w-64',
        // Mobile: Hidden by default, customizable via props if needed, but for now standard responsive behavior
        'hidden md:flex'
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-border/50">
        {!collapsed && (
            <span className="font-bold text-lg text-primary tracking-tight">Anclora</span>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <span className="mr-3 text-xl">{item.emoji}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-2">
         <Link
              href="/settings"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                pathname === '/settings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
              )}
               title={collapsed ? 'Configuración' : undefined}
            >
              {/* <Settings className="h-5 w-5 flex-shrink-0" /> */}
              <span className="text-xl mr-2">⚙️</span>
              {!collapsed && <span>Configuración</span>}
            </Link>

        <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center mt-2"
            onClick={() => setCollapsed(!collapsed)}
        >
             {collapsed ? <span>▶</span> : <span>◀</span>}
             {!collapsed && <span className="ml-2 text-xs">Colapsar</span>}
        </Button>
      </div>
    </aside>
  )
}
