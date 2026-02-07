"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryQuickAdd } from "../categories/category-quick-add";
import { useToast } from "@/hooks/use-toast";

const transactionSchema = z.object({
  description: z.string().min(1, "La descripción es requerida"),
  amount: z.number().positive("La cantidad debe ser mayor a 0"),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  date: z.string(),
  accountId: z.string().min(1, "Selecciona una cuenta"),
  categoryId: z.string().optional(),
  merchant: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export function TransactionForm({ 
  initialData,
  onSuccess 
}: { 
  initialData?: any;
  onSuccess?: () => void 
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCategorizing, setIsCategorizing] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: initialData ? {
      description: initialData.description,
      amount: Number(initialData.amount),
      type: initialData.type,
      date: new Date(initialData.date).toISOString().split("T")[0],
      accountId: initialData.accountId,
      categoryId: initialData.categoryId || "",
      merchant: initialData.merchant || "",
    } : {
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const { data: accounts } = useQuery({ queryKey: ["accounts"], queryFn: () => fetch("/api/accounts").then(res => res.json()) });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => fetch("/api/categories").then(res => res.json()) });

  const mutation = useMutation({
    mutationFn: async (data: TransactionFormValues) => {
      const url = initialData?.id ? `/api/transactions/${initialData.id}` : "/api/transactions";
      const method = initialData?.id ? "PATCH" : "POST";

      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) 
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al procesar la transacción");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({
        title: initialData ? "Transacción actualizada" : "Transacción creada",
        description: "Los cambios se han guardado correctamente."
      });
      onSuccess?.();
      if (!initialData) reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const description = watch("description");
  const amount = watch("amount");
  const transactionType = watch("type");

  const filteredCategories = categories?.filter((cat: any) => {
    if (transactionType === "TRANSFER") return false;
    return cat.type === transactionType;
  });

  const handleAutoCategorize = async () => {
    if (!description || !amount || initialData) return; // Avoid auto-categorize if editing
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

  const onSubmit = (data: TransactionFormValues) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Descripción</label>
          <Input 
            {...register("description")} 
            onBlur={() => description && handleAutoCategorize()}
          />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Comercio (opcional)</label>
          <Input 
            {...register("merchant")} 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Cantidad</label>
          <Input 
            type="number" 
            step="0.01" 
            {...register("amount", { valueAsNumber: true })} 
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>
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
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Fecha</label>
          <Input 
            type="date" 
            {...register("date")} 
          />
          {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
        </div>
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
          {errors.accountId && <p className="text-xs text-destructive">{errors.accountId.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium flex items-center gap-2">
            Categoría
            {isCategorizing && <Loader2 className="h-3 w-3 animate-spin" />}
          </label>
          <div className="flex items-center gap-2">
            <select 
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sin categoría</option>
              {filteredCategories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {transactionType !== "TRANSFER" && !initialData && (
              <CategoryQuickAdd 
                type={transactionType as "INCOME" | "EXPENSE"} 
                onSuccess={(id) => setValue("categoryId", id)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Transacción"}
        </Button>
      </div>
    </form>
  );
}
