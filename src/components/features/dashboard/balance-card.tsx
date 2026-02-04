import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <Card className={cn(
      "bg-primary text-primary-foreground border-none shadow-lg glow-primary",
      "relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]"
    )}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10 blur-2xl group-hover:bg-white/20 transition-colors" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
        <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
        <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
          <Wallet className="h-4 w-4 text-primary-foreground" />
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold font-outfit tracking-tight">
          {formatCurrency(balance)}
        </div>
        <p className="text-xs text-primary-foreground/80 mt-1 flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-white/50 animate-pulse" />
          Saldo acumulado en todas las cuentas
        </p>
      </CardContent>
    </Card>
  );
}
