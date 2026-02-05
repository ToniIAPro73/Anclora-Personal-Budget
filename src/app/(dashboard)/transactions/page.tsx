"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Transacciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus ingresos y gastos.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Nueva Transacción
        </Button>
      </div>

      {/* Empty State */}
      <Card className="premium-card">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-muted-foreground mb-4">No hay transacciones registradas aún.</p>
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Crear Primera Transacción
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
