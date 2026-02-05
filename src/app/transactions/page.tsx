"use client";

import { useQuery } from "@tanstack/react-query";
import { TransactionList } from "@/components/features/transactions/transaction-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TransactionForm } from "@/components/features/transactions/transaction-form";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  
  const { data, isLoading } = useQuery<any>({
    queryKey: ["transactions", page],
    queryFn: async () => {
      const res = await fetch(`/api/transactions?page=${page}`);
      return res.json();
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit tracking-tight">Transacciones</h2>
          <p className="text-muted-foreground">Gestiona tus ingresos y gastos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md">
            Filtrar
          </Button>
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4 mr-2" /> Nueva Transacción
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <TransactionList transactions={data.transactions} />
          {data.pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Página {page} de {data.pagination.totalPages}
              </div>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
