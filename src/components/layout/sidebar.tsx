'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ThemeToggle } from "@/components/ui/theme-toggle"

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
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md glow-primary'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
              title={collapsed ? item.name : undefined}
            >
              <span className={cn(
                "text-xl transition-transform group-hover:scale-110",
                isActive && "scale-110"
              )}>
                {item.emoji}
              </span>
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50 space-y-4">
        {!collapsed && (
          <div className="flex items-center justify-center animate-fade-in">
            <ThemeToggle />
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
      </div>

      {/* Floating toggle button - ALWAYS visible */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          "absolute -right-3 top-20 z-50",
          "h-6 w-6 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "hover:scale-110 active:scale-95",
          "transition-all duration-200",
          "flex items-center justify-center",
          "border-2 border-background"
        )}
        aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
      >
        <span className="text-xs font-bold">
          {collapsed ? '›' : '‹'}
        </span>
      </button>
    </aside>
  )
}
