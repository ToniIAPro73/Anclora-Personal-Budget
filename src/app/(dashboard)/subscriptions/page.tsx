"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SubscriptionFormDialog } from "@/components/features/subscriptions/subscription-form-dialog";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  frequency: "MONTHLY" | "YEARLY" | "QUARTERLY" | "BIANNUAL";
  nextBillingDate: string;
  category: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
}

export default function SubscriptionsPage() {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PAUSED" | "CANCELLED">("ACTIVE");

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["subscriptions", filter],
    queryFn: async () => {
      const res = await fetch(`/api/subscriptions?status=${filter}`);
      return res.json();
    },
  });

  const stats = {
    monthlyTotal: subscriptions
      .filter((s: Subscription) => s.status === "ACTIVE")
      .reduce((sum: number, s: Subscription) => {
        if (s.frequency === "MONTHLY") return sum + s.amount;
        if (s.frequency === "YEARLY") return sum + (s.amount / 12);
        if (s.frequency === "QUARTERLY") return sum + (s.amount / 3);
        if (s.frequency === "BIANNUAL") return sum + (s.amount / 6);
        return sum;
      }, 0),
    count: subscriptions.filter((s: Subscription) => s.status === "ACTIVE").length,
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
              <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                <Plus className="h-4 w-4 mr-2" /> Crear Suscripción
              </Button>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription: Subscription) => (
            <Card key={subscription.id} className="premium-card">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm">{subscription.name}</h3>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full font-medium",
                        subscription.status === "ACTIVE" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
                        subscription.status === "PAUSED" && "bg-amber-500/20 text-amber-700 dark:text-amber-400",
                        subscription.status === "CANCELLED" && "bg-red-500/20 text-red-700 dark:text-red-400"
                      )}>
                        {subscription.status === "ACTIVE" ? "Activa" : subscription.status === "PAUSED" ? "Pausada" : "Cancelada"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">📅</span>
                        <span>{frequencyLabels[subscription.frequency]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Próximo: {new Date(subscription.nextBillingDate).toLocaleDateString("es-ES")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-bold font-outfit">{formatCurrency(subscription.amount)}</div>
                    <p className="text-xs text-muted-foreground">{subscription.category}</p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button variant="secondary" size="sm" className="rounded-lg h-8 w-8 p-0">
                      <span className="text-sm">✏️</span>
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-lg h-8 w-8 p-0 text-red-500 hover:text-red-600">
                      <span className="text-sm">🗑️</span>
                    </Button>
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
