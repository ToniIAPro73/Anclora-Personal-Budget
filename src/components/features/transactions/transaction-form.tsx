"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const transactionSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("Monto debe ser mayor a 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  date: z.string(),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const { data: accounts } = useQuery({ queryKey: ["accounts"], queryFn: () => fetch("/api/accounts").then(res => res.json()) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => fetch("/api/categories").then(res => res.json()) });

  const createMutation = useMutation({
    mutationFn: (data: TransactionFormValues) => fetch("/api/transactions", { method: "POST", body: JSON.stringify(data) }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      onSuccess?.();
    },
  });

  const description = watch("description");
  const amount = watch("amount");

  // AI Categorization trigger
  const handleAutoCategorize = async () => {
    if (!description || !amount) return;
    setIsCategorizing(true);
    try {
      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        body: JSON.stringify({ 
          description, 
          amount: Number(amount), 
          date: watch("date"),
          merchant: watch("merchant") 
        }),
      });
      const data = await res.json();
      if (data.categoryId) {
        setValue("categoryId", data.categoryId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const onSubmit = (data: TransactionFormValues) => createMutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input 
          label="Descripción" 
          {...register("description")} 
          error={errors.description?.message}
          onBlur={() => description && handleAutoCategorize()}
        />
        <Input 
          label="Comercio (opcional)" 
          {...register("merchant")} 
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input 
          label="Monto" 
          type="number" 
          step="0.01" 
          {...register("amount", { valueAsNumber: true })} 
          error={errors.amount?.message}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Tipo</label>
          <select 
            {...register("type")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="EXPENSE">Gasto</option>
            <option value="INCOME">Ingreso</option>
            <option value="TRANSFER">Transferencia</option>
          </select>
        </div>
        <Input 
          label="Fecha" 
          type="date" 
          {...register("date")} 
          error={errors.date?.message}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Cuenta</label>
          <select 
            {...register("accountId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Selecciona cuenta</option>
            {accounts?.map((acc: any) => (
              <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-danger">{errors.accountId.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium flex items-center justify-between">
            Categoría
            {isCategorizing && <Loader2 className="h-3 w-3 animate-spin" />}
          </label>
          <select 
            {...register("categoryId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Guardando..." : "Crear Transacción"}
        </Button>
      </div>
    </form>
  );
}
