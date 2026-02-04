import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export function BudgetProgressList({ budgets }: { budgets: any[] }) {
  if (!budgets?.length) return <div className="text-sm text-muted-foreground italic">No hay presupuestos activos este mes.</div>;

  return (
    <div className="space-y-6">
      {budgets.map((budget) => {
        const spent = budget.allocations.reduce((sum: number, a: any) => sum + Number(a.spent), 0);
        const total = Number(budget.totalAmount);
        const percentage = Math.min((spent / total) * 100, 100);
        const isOver = spent > total;

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{budget.name}</span>
              <span className={isOver ? "text-danger font-bold" : "text-muted-foreground"}>
                {formatCurrency(spent)} / {formatCurrency(total)}
              </span>
            </div>
            <Progress value={percentage} className={isOver ? "bg-danger/20 indicator-danger" : ""} />
            <div className="text-[10px] text-muted-foreground text-right italic">
              {isOver ? "Excedido por " + formatCurrency(spent - total) : (100 - percentage).toFixed(0) + "% restante"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
