"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ProjectionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-outfit tracking-tight">Proyecciones de Flujo de Caja</h2>
        <p className="text-sm text-muted-foreground">Previsiones basadas en tus hábitos y transacciones recurrentes.</p>
      </div>

      {/* Placeholder */}
      <Card className="premium-card">
        <CardContent className="text-center py-12">
          <TrendingUp className="h-16 w-16 mx-auto mb-4 text-primary opacity-50" />
          <p className="text-muted-foreground mb-2">Proyecciones disponibles próximamente</p>
          <p className="text-xs text-muted-foreground">Necesitas al menos 3 meses de datos para generar proyecciones precisas.</p>
        </CardContent>
      </Card>
    </div>
  );
}
