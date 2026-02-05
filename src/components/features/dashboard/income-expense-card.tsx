import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export function IncomeExpenseCard({ income, expenses }: { income: number, expenses: number }) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-3">
        <CardTitle className="text-xs font-medium text-muted-foreground">Flujo de Efectivo Mensual</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center gap-3 pb-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-success text-[10px] font-medium mb-0.5">
            <ArrowUpCircle className="h-3 w-3" /> Ingresos
          </div>
          <div className="text-lg font-bold font-outfit leading-none">{formatCurrency(income)}</div>
        </div>
        <div className="h-8 w-px bg-border shadow-inner" />
        <div className="flex flex-col text-right">
          <div className="flex items-center gap-1 text-danger text-[10px] font-medium mb-0.5 justify-end">
            <ArrowDownCircle className="h-3 w-3" /> Gastos
          </div>
          <div className="text-lg font-bold font-outfit leading-none">{formatCurrency(expenses)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
