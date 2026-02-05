"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import { Loader2, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { BudgetFormDialog } from "./budget-form-dialog";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  alertThreshold: number | null;
  period: string;
  category: {
    name: string;
    icon: string;
    color: string;
  } | null;
  allocations: Array<{
    spent: number;
    amount: number;
    category: {
      name: string;
      icon: string;
      color: string;
    }
  }>;
}

export function BudgetList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: budgets, isLoading, error } = useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: () => fetch("/api/budgets").then(res => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el presupuesto");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Presupuesto eliminado", description: "El presupuesto se ha desactivado correctamente." });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !budgets || !Array.isArray(budgets)) {
    return (
      <div className="text-center py-12 text-destructive">
        Error al cargar los presupuestos o formato de datos inválido.
      </div>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card className="premium-card">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">💳</div>
          <p className="text-muted-foreground mb-4">No hay presupuestos creados aún.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {budgets.map((budget) => {
        const mainAllocation = budget.allocations?.[0];
        const categoryInfo = mainAllocation?.category || budget.category;
        
        const spent = Number(mainAllocation?.spent || 0);
        const limit = Number(mainAllocation?.amount || budget.totalAmount);
        const percent = Math.min((spent / limit) * 100, 100);
        const isOverBudget = spent > limit;
        const isNearLimit = budget.alertThreshold && (limit - spent) <= budget.alertThreshold;

        return (
          <Card key={budget.id} className="premium-card overflow-hidden relative group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: categoryInfo?.color || "#3b82f6" }}
                  >
                    <span className="text-lg">
                      {categoryInfo?.icon === "home" ? "🏠" : 
                       categoryInfo?.icon === "shopping-cart" ? "🛒" : 
                       categoryInfo?.icon === "bus" ? "🚌" : 
                       categoryInfo?.icon === "film" ? "🎬" : 
                       categoryInfo?.icon === "activity" ? "🏥" : "📂"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight truncate max-w-[120px]" title={budget.name}>
                      {budget.name}
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {budget.period === "MONTHLY" ? "Mensual" : 
                       budget.period === "QUARTERLY" ? "Trimestral" : "Anual"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <BudgetFormDialog initialData={budget}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                      </BudgetFormDialog>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onSelect={() => {
                          if (confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) {
                            deleteMutation.mutate(budget.id);
                          }
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="text-sm font-bold mt-1 text-right">{formatCurrency(limit)}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className={cn(
                    "font-medium",
                    isOverBudget ? "text-danger" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {isOverBudget ? "Presupuesto excedido" : isNearLimit ? "Cerca del límite" : "Consumo"}
                  </span>
                  <span className="font-bold">{percent.toFixed(0)}%</span>
                </div>
                <Progress 
                  value={percent} 
                  className="h-2" 
                  indicatorClassName={cn(
                    isOverBudget ? "bg-danger" : isNearLimit ? "bg-amber-500" : "bg-primary"
                  )}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Gastado: {formatCurrency(spent)}</span>
                  <span>Restan: {formatCurrency(Math.max(0, limit - spent))}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
