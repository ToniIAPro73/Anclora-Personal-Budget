'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSelector } from "@/components/ui/language-selector"

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    emoji: "📊"
  },
  {
    name: 'Cuentas',
    href: '/accounts',
    emoji: "💰"
  },
  {
    name: 'Presupuestos',
    href: '/budgets',
    emoji: "💳"
  },
  {
    name: 'Transacciones',
    href: '/transactions',
    emoji: "💸"
  },
  {
    name: 'Suscripciones',
    href: '/subscriptions',
    emoji: "🔄"
  },
  {
    name: 'Proyecciones',
    href: '/projections',
    emoji: "📈"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border/50 bg-card/50 backdrop-blur-md transition-all duration-300 z-50 h-full',
        collapsed ? 'w-16' : 'w-64',
        'hidden md:flex'
      )}
    >
      <div className="flex items-center justify-between p-4 h-16 border-b border-border/50">
        {!collapsed && (
            <span className="font-bold text-lg text-primary tracking-tight gradient-text">Anclora Budget</span>
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
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md glow-primary'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <span className={cn("mr-3 text-xl transition-transform group-hover:scale-110", isActive && "scale-110")}>{item.emoji}</span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        {!collapsed && (
          <div className="flex items-center justify-between gap-2 animate-fade-in">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        )}

        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
          )}
          title={collapsed ? 'Configuración' : undefined}
        >
          <span className="text-xl mr-2">⚙️</span>
          {!collapsed && <span>Configuración</span>}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center mt-2 hover:bg-secondary/50 rounded-xl"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <span>▶</span> : <span>◀</span>}
          {!collapsed && <span className="ml-2 text-xs">Colapsar</span>}
        </Button>
      </div>
    </aside>
  )
}
