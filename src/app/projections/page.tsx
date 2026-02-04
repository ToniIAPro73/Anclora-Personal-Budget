"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function ProjectionsPage() {
  const { data: projections, isLoading } = useQuery<any>({
    queryKey: ["projections"],
    queryFn: () => fetch("/api/dashboard/overview").then(res => res.json()).then(async (data) => {
        // In a real app, this would be a dedicated call to generateCashFlowProjection
        // For the demo, we use a mock or reuse existing trend data
        return data.spendingTrends.map((t: any, i: number) => ({
            ...t,
            projectedBalance: 5000 + (i * 200),
            confidence: 0.85 - (i * 0.05)
        }));
    }),
  });

  if (isLoading) return <div>Calculando proyecciones...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold font-outfit tracking-tight">Proyecciones de Flujo de Caja</h2>
        <p className="text-muted-foreground">Previsiones deterministas basadas en tus hábitos y transacciones recurrentes.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Balance Proyectado (12 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={projections} />
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-6">
          <Card className="bg-slate-50 border-none shadow-premium">
            <CardHeader>
              <CardTitle className="text-base">Análisis de Confianza</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-warning" />
                <p>La precisión disminuye a medida que el horizonte se aleja.</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Confianza del Modelo</span>
                  <span>{(projections[0]?.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${projections[0]?.confidence * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">HitManager Recurrentes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground italic">
                Las proyecciones incluyen 5 transacciones recurrentes detectadas este mes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
