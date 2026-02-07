"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { SubscriptionFormDialog } from "@/components/features/subscriptions/subscription-form-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  frequency: "MONTHLY" | "YEARLY" | "QUARTERLY" | "BIANNUAL";
  nextBillingDate: string;
  nextDate?: string;
  category: { name: string } | string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  isActive: boolean;
}

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "CANCELLED">("ACTIVE");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", filter],
    queryFn: async () => {
      const res = await fetch(`/api/subscriptions?status=${filter}`);
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la suscripción");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({ title: "Suscripción eliminada", description: "La suscripción se ha eliminado correctamente." });
    },
  });

  const stats = {
    monthlyTotal: Array.isArray(subscriptions) 
      ? subscriptions
        .filter((s: any) => s.isActive)
        .reduce((sum: number, s: any) => {
          const amount = Number(s.amount);
          if (s.frequency === "MONTHLY") return sum + amount;
          if (s.frequency === "YEARLY") return sum + (amount / 12);
          if (s.frequency === "QUARTERLY") return sum + (amount / 3);
          if (s.frequency === "BIANNUAL") return sum + (amount / 6);
          return sum;
        }, 0)
      : 0,
    count: Array.isArray(subscriptions) ? subscriptions.filter((s: any) => s.isActive).length : 0,
  };

  const frequencyLabels: Record<string, string> = {
    MONTHLY: "Mensual",
    YEARLY: "Anual",
    QUARTERLY: "Trimestral",
    BIANNUAL: "Semestral",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Suscripciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus suscripciones y servicios recurrentes.</p>
        </div>
        <SubscriptionFormDialog />
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Gasto Mensual</CardTitle>
              <span className="text-primary text-lg">💵</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit">{formatCurrency(stats.monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.count} suscripciones activas</p>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Gasto Anual Proyectado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit">{formatCurrency(stats.monthlyTotal * 12)}</div>
            <p className="text-xs text-muted-foreground mt-1">Basado en suscripciones activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["ALL", "ACTIVE", "PAUSED", "CANCELLED"] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(status)}
            className="rounded-lg"
          >
            {status === "ALL" ? "Todas" : status === "ACTIVE" ? "Activas" : status === "PAUSED" ? "Pausadas" : "Canceladas"}
          </Button>
        ))}
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando suscripciones...</div>
        ) : subscriptions.length === 0 ? (
          <Card className="premium-card">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">No hay suscripciones en este estado.</p>
              <SubscriptionFormDialog>
                <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                  <Plus className="h-4 w-4 mr-2" /> Crear Suscripción
                </Button>
              </SubscriptionFormDialog>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription: any) => (
            <Card key={subscription.id} className="premium-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm">{subscription.description || subscription.name}</h3>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        subscription.isActive && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                        !subscription.isActive && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                        subscription.status === "CANCELLED" && "bg-red-500/20 text-red-700 dark:text-red-400"
                      )}>
                        {subscription.isActive ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📅</span>
                        <span>{frequencyLabels[subscription.frequency]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Próximo: {new Date(subscription.nextDate || subscription.nextBillingDate).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold font-outfit">{formatCurrency(subscription.amount)}</div>
                    <p className="text-xs text-muted-foreground">{subscription.category?.name || "Gasto"}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <SubscriptionFormDialog initialData={subscription}>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                        </SubscriptionFormDialog>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onSelect={() => {
                            if (confirm("¿Estás seguro de que quieres eliminar esta suscripción?")) {
                              deleteMutation.mutate(subscription.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4 mr-2" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
