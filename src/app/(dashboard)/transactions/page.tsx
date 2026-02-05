"use client";

import { useQuery } from "@tanstack/react-query";
import { TransactionList } from "@/components/features/transactions/transaction-list";
import { TransactionFormDialog } from "@/components/features/transactions/transaction-form-dialog";
import { Loader2 } from "lucide-react";

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then(res => res.json()),
  });

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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TransactionList transactions={data?.transactions || []} />
      )}
    </div>
  );
}
