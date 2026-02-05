"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => fetch("/api/dashboard/overview").then(res => res.json()).then(data => data.budgets),
  });

  if (isLoading) return <div className="text-center py-8">Cargando presupuestos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Presupuestos</h2>
          <p className="text-sm text-muted-foreground">Controla tus límites de gasto por categoría.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Presupuesto
        </Button>
      </div>

      {/* Budgets Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {budgets && budgets.length > 0 ? (
          budgets.map((budget: any) => (
            <Card key={budget.id} className="premium-card flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-sm">{budget.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(budget.startDate)} - {formatDate(budget.endDate)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold font-outfit">{formatCurrency(Number(budget.totalAmount))}</div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                {budget.allocations && budget.allocations.length > 0 ? (
                  budget.allocations.map((alloc: any) => {
                    const percentage = (Number(alloc.spent) / Number(alloc.amount)) * 100;
                    const isOverBudget = percentage > 100;
                    
                    return (
                      <div key={alloc.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium">{alloc.category.name}</span>
                          <span className={cn(
                            "font-bold",
                            isOverBudget ? "text-red-500" : "text-foreground"
                          )}>
                            {formatCurrency(Number(alloc.spent))} / {formatCurrency(Number(alloc.amount))}
                          </span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={Math.min(percentage, 100)} 
                            className={cn(
                              "h-2",
                              isOverBudget && "bg-red-500/20"
                            )}
                          />
                          {isOverBudget && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3 text-red-500" />
                              <span className="text-xs text-red-500 font-medium">
                                Excedido por {formatCurrency(Number(alloc.spent) - Number(alloc.amount))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-xs">
                    Sin asignaciones de presupuesto
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">No hay presupuestos creados aún.</p>
            <Button className="bg-primary hover:bg-primary/90 rounded-lg">
              <Plus className="h-4 w-4 mr-2" /> Crear Primer Presupuesto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
