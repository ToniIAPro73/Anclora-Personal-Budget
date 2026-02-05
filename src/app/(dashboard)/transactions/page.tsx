"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransactionFormDialog } from "@/components/features/transactions/transaction-form-dialog";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Transacciones</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus ingresos y gastos.</p>
        </div>
        <TransactionFormDialog />
      </div>

      {/* Empty State */}
      <Card className="premium-card">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">💸</div>
          <p className="text-muted-foreground mb-4">No hay transacciones registradas aún.</p>
          <TransactionFormDialog 
            trigger={
              <Button className="bg-primary hover:bg-primary/90 rounded-lg">
                <Plus className="h-4 w-4 mr-2" /> Crear Primera Transacción
              </Button>
            } 
          />
        </CardContent>
      </Card>
    </div>
  );
}
