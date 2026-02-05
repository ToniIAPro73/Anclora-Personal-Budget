"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CategoryQuickAdd } from "../categories/category-quick-add";

const budgetSchema = z.object({
  categoryId: z.string().min(1, "Selecciona una categoría"),
  amount: z.number().positive("El presupuesto debe ser mayor a 0"),
  period: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]),
  alertThreshold: z.number().optional(),
});

type BudgetValues = z.infer<typeof budgetSchema>;

export function BudgetForm({ onSuccess }: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BudgetValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      period: "MONTHLY",
    },
  });

  const { data: categories } = useQuery({ 
    queryKey: ["categories"], 
    queryFn: () => fetch("/api/categories").then(res => res.json()) 
  });

  const mutation = useMutation({
    mutationFn: async (data: BudgetValues) => {
      // Find category name for default budget name
      const category = categories?.find((c: any) => c.id === data.categoryId);
      
      const payload = {
        ...data,
        name: category ? `Presupuesto ${category.name}` : "Nuevo Presupuesto",
        totalAmount: data.amount,
        allocations: [{
          categoryId: data.categoryId,
          amount: data.amount,
        }]
      };

      const response = await fetch("/api/budgets", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload) 
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el presupuesto");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast({ title: "Presupuesto creado", description: "El presupuesto se ha configurado correctamente." });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: BudgetValues) => mutation.mutate(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Categoría</Label>
          <div className="flex items-center gap-2">
            <select 
              id="categoryId"
              {...register("categoryId")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition-all"
            >
              <option value="">Selecciona una categoría</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <CategoryQuickAdd 
              type="EXPENSE" 
              onSuccess={(id) => setValue("categoryId", id)}
            />
          </div>
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Límite de Gasto</Label>
          <Input 
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="alertThreshold">Umbral de Alerta (opcional)</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">≤</span>
            <Input 
              id="alertThreshold"
              type="number"
              step="0.01"
              placeholder="Ej: 50.00"
              className="pl-7"
              {...register("alertThreshold", { valueAsNumber: true })}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">Te avisaremos cuando el presupuesto restante baje de esta cantidad.</p>
          {errors.alertThreshold && <p className="text-xs text-destructive">{errors.alertThreshold.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="period">Periodo</Label>
          <select 
            id="period"
            {...register("period")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring transition-all"
          >
            <option value="MONTHLY">Mensual</option>
            <option value="QUARTERLY">Trimestral</option>
            <option value="YEARLY">Anual</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          className="rounded-lg"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Guardando..." : "Configurar Presupuesto"}
        </Button>
      </div>
    </form>
  );
}
