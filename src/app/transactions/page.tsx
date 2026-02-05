"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  account: string;
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", month, filter],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?month=${month}&type=${filter}`);
      return res.json();
    },
  });

  const stats = {
    income: transactions
      .filter((t: Transaction) => t.type === "INCOME")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
    expenses: transactions
      .filter((t: Transaction) => t.type === "EXPENSE")
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
  };

  const net = stats.income - stats.expenses;

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

      {/* Stats Cards */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit text-emerald-500">
              {formatCurrency(stats.income)}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium">Gastos</CardTitle>
              <span className="text-red-500 text-lg">📉</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit text-red-500">
              {formatCurrency(stats.expenses)}
            </div>
          </CardContent>
        </Card>

        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Neto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold font-outfit", net >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(net)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm"
        />
        <div className="flex gap-2">
          {(["ALL", "INCOME", "EXPENSE"] as const).map((type) => (
            <Button
              key={type}
              variant={filter === type ? "primary" : "secondary"}
              size="sm"
              onClick={() => setFilter(type)}
              className="rounded-lg"
            >
              {type === "ALL" ? "Todas" : type === "INCOME" ? "Ingresos" : "Gastos"}
            </Button>
          ))}
        </div>
        <Button variant="secondary" size="sm" className="ml-auto rounded-lg">
          <span className="mr-2">⬇️</span> Exportar
        </Button>
      </div>

      {/* Transactions List */}
      <Card className="premium-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Historial de Transacciones</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando transacciones...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay transacciones para este período.</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction: Transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors border border-border/50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{transaction.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                  <div className={cn(
                    "font-bold text-sm",
                    transaction.type === "INCOME" ? "text-emerald-500" : "text-red-500"
                  )}>
                    {transaction.type === "INCOME" ? "+" : "-"}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
