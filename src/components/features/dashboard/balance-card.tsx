import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet } from "lucide-react";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <Card className="bg-primary text-primary-foreground border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Balance Total</CardTitle>
        <Wallet className="h-4 w-4 text-primary-foreground/70" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold font-outfit">{formatCurrency(balance)}</div>
        <p className="text-xs text-primary-foreground/70 mt-1">Saldo acumulado en todas las cuentas</p>
      </CardContent>
    </Card>
  );
}
