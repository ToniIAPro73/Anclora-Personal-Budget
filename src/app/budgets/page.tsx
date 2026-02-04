"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => fetch("/api/dashboard/overview").then(res => res.json()).then(data => data.budgets),
  });

  if (isLoading) return <div>Cargando presupuestos...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit tracking-tight">Presupuestos</h2>
          <p className="text-muted-foreground">Controla tus límites de gasto por categoría.</p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Presupuesto
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets?.map((budget: any) => (
          <Card key={budget.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{budget.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Del {formatDate(budget.startDate)} al {formatDate(budget.endDate)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-outfit">{formatCurrency(Number(budget.totalAmount))}</div>
                  <p className="text-xs text-muted-foreground">Presupuesto Total</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {budget.allocations.map((alloc: any) => {
                const percentage = (Number(alloc.spent) / Number(alloc.amount)) * 100;
                return (
                  <div key={alloc.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{alloc.category.name}</span>
                      <span className="font-medium">{formatCurrency(Number(alloc.spent))} / {formatCurrency(Number(alloc.amount))}</span>
                    </div>
                    <Progress value={percentage} className={percentage > 100 ? "bg-danger/20 indicator-danger" : ""} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
