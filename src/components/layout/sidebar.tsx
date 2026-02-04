"use client";

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

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transacciones", href: "/transactions", icon: ReceiptText },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Presupuestos", href: "/budgets", icon: PieChart },
  { name: "Metas", href: "/goals", icon: Target },
  { name: "Proyecciones", href: "/projections", icon: TrendingUp },
  { name: "Asesor IA", href: "/advisor", icon: Sparkles },
  { name: "Ajustes", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card shadow-sm">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold font-outfit text-primary">Anclora Budget</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        {/* User profile / Logout placeholder */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            U
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium truncate">Usuario</p>
            <p className="text-[10px] text-muted-foreground truncate">usuario@ejemplo.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
