import { TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

export function RevenueCard({ className }: { className?: string }) {
  return (
    <div className={cn("premium-card p-6", className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium text-muted-foreground">Ingresos Totales</h3>
        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
             <TrendingUp className="h-4 w-4" />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold">€45,231.89</div>
        <div className="flex items-center text-xs text-muted-foreground pt-1">
            <span className="text-emerald-500 flex items-center font-medium">
                +20.1% 
            </span>
            <span className="ml-2">vs mes anterior</span>
        </div>
      </div>
      
      {/* Decorative gradient/chart placeholder */}
      <div className="mt-4 h-1 w-full bg-secondary rounded-full overflow-hidden">
        <div className="h-full bg-emerald-500 w-[75%] rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}
