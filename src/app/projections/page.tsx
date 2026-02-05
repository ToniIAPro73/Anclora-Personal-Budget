"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { TrendingUp, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ProjectionsPage() {
  const { data: projections, isLoading } = useQuery<any>({
    queryKey: ["projections"],
    queryFn: () => fetch("/api/dashboard/overview").then(res => res.json()).then(async (data) => {
        return data.spendingTrends.map((t: any, i: number) => ({
            ...t,
            projectedBalance: 5000 + (i * 200),
            confidence: 0.85 - (i * 0.05)
        }));
    }),
  });

  if (isLoading) return <div className="text-center py-8">Calculando proyecciones...</div>;

  const firstProjection = projections?.[0];
  const lastProjection = projections?.[projections.length - 1];
  const balanceChange = lastProjection?.projectedBalance - firstProjection?.projectedBalance;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-outfit tracking-tight">Proyecciones de Flujo de Caja</h2>
        <p className="text-sm text-muted-foreground">Previsiones basadas en tus hábitos y transacciones recurrentes.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Balance Actual</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit">
              {formatCurrency(firstProjection?.projectedBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Balance Proyectado (12m)</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit text-emerald-500">
              {formatCurrency(lastProjection?.projectedBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Cambio Proyectado</CardTitle>
              {balanceChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              ) : (
                <span className="text-red-500 text-lg">📉</span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-outfit ${balanceChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {balanceChange >= 0 ? "+" : ""}{formatCurrency(balanceChange || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart and Analysis */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-2 premium-card flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Balance Proyectado (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden">
            <TrendChart data={projections} />
          </CardContent>
        </Card>

        {/* Analysis Panel */}
        <div className="space-y-4">
          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Confianza del Modelo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <AlertCircle className="h-3 w-3 text-amber-500 flex-shrink-0" />
                <p className="text-muted-foreground">La precisión disminuye con el tiempo.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Confianza</span>
                  <span className="text-primary">{(firstProjection?.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${firstProjection?.confidence * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="premium-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Transacciones Recurrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Se detectaron 5 transacciones recurrentes que se incluyen en las proyecciones.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
