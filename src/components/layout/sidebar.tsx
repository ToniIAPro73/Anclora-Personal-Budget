'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  PieChart, 
  Target, 
  TrendingUp, 
  Sparkles, 
  Settings 
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSelector } from "@/components/ui/language-selector";

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
    name: 'Asesor IA',
    href: '/advisor',
    emoji: "🤖"
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
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-md shadow-sm">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold font-outfit text-primary gradient-text">Anclora Budget</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md glow-primary" 
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 space-y-4 border-t border-border/50">
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        
        <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/30 border border-border/50">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
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
