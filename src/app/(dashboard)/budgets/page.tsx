"use client";

import { BudgetFormDialog } from "@/components/features/budgets/budget-form-dialog";
import { BudgetList } from "@/components/features/budgets/budget-list";

export default function BudgetsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Presupuestos</h2>
          <p className="text-sm text-muted-foreground">Controla tus límites de gasto por categoría.</p>
        </div>
        <BudgetFormDialog />
      </div>

      {/* Budget List */}
      <BudgetList />
    </div>
  );
}
