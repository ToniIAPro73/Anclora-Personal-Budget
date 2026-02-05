"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BudgetFormDialog } from "@/components/features/budgets/budget-form-dialog";

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

      {/* Empty State */}
      <Card className="premium-card">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-muted-foreground mb-4">No hay presupuestos creados aún.</p>
          <BudgetFormDialog 
            trigger={
              <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                <Plus className="h-4 w-4 mr-2" /> Crear Primer Presupuesto
              </Button>
            } 
          />
        </CardContent>
      </Card>
    </div>
  );
}
