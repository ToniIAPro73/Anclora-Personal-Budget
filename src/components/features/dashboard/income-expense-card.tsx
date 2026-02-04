import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export function IncomeExpenseCard({ income, expenses }: { income: number, expenses: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Flujo de Efectivo Mensual</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-success text-xs font-medium mb-1">
            <ArrowUpCircle className="h-3 w-3" /> Ingresos
          </div>
          <div className="text-xl font-bold font-outfit">{formatCurrency(income)}</div>
        </div>
        <div className="h-10 w-px bg-border shadow-inner" />
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1 text-danger text-xs font-medium mb-1 justify-end">
            <ArrowDownCircle className="h-3 w-3" /> Gastos
          </div>
          <div className="text-xl font-bold font-outfit">{formatCurrency(expenses)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
