"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { subscriptionSchema, type SubscriptionFormData } from "@/lib/form-schemas";
import { useToast } from "@/hooks/use-toast";

const FREQUENCIES = [
  { value: "MONTHLY", label: "Mensual" },
  { value: "QUARTERLY", label: "Trimestral" },
  { value: "BIANNUAL", label: "Semestral" },
  { value: "YEARLY", label: "Anual" },
] as const;

export function SubscriptionFormDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Accounts and Categories
  const { data: accounts } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetch("/api/accounts").then(res => res.json())
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetch("/api/categories").then(res => res.json())
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema) as any,
    defaultValues: {
      name: "",
      amount: 0,
      frequency: "MONTHLY",
      status: "ACTIVE",
      nextBillingDate: new Date(),
    },
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la suscripción");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "✅ Suscripción creada",
        description: "La suscripción se ha guardado correctamente.",
      });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    createSubscriptionMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Nueva Suscripción
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-5 w-5 flex items-center justify-center text-primary">🔄</span>
            Nueva Suscripción
          </DialogTitle>
          <DialogDescription>
            Añade un servicio recurrente para seguir mejor tus gastos de forma eficiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 px-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del servicio *</Label>
                <Input
                  id="name"
                  placeholder="Ej: Netflix, Spotify, Internet..."
                  {...register("name")}
                  className="h-11"
                />
                {errors.name && (
                  <p className="text-xs text-destructive font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Costo del servicio *</Label>
                <CurrencyInput
                  id="amount"
                  value={watch("amount")}
                  onChange={(value: number) => setValue("amount", value)}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive font-medium">{errors.amount.message}</p>
                )}
              </div>

               {/* Account */}
               <div className="space-y-2">
                <Label htmlFor="accountId">Cuenta de cargo *</Label>
                <Select
                  onValueChange={(value: string) => setValue("accountId", value)}
                  value={watch("accountId")}
                >
                  <SelectTrigger id="accountId" className="h-11">
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                    {!accounts?.length && <p className="p-2 text-xs text-muted-foreground">No hay cuentas disponibles</p>}
                  </SelectContent>
                </Select>
                {errors.accountId && (
                  <p className="text-xs text-destructive font-medium">{errors.accountId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frecuencia de cobro *</Label>
                <Select
                  onValueChange={(value: string) => setValue("frequency", value as any)}
                  value={watch("frequency")}
                >
                  <SelectTrigger id="frequency" className="h-11">
                    <SelectValue placeholder="Selecciona frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.frequency && (
                  <p className="text-xs text-destructive font-medium">{errors.frequency.message}</p>
                )}
              </div>

              {/* Next Billing Date */}
              <div className="space-y-2">
                <Label htmlFor="nextBillingDate">Próxima fecha de cobro *</Label>
                <Input
                  id="nextBillingDate"
                  type="date"
                  onChange={(e) => setValue("nextBillingDate", new Date(e.target.value))}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="h-11"
                />
                {errors.nextBillingDate && (
                  <p className="text-xs text-destructive font-medium">{errors.nextBillingDate.message}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoría de gasto *</Label>
                <Select
                  onValueChange={(value: string) => setValue("categoryId", value)}
                  value={watch("categoryId")}
                >
                  <SelectTrigger id="categoryId" className="h-11">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.filter((c: any) => c.type === "EXPENSE").map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive font-medium">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={createSubscriptionMutation.isPending}
            className="rounded-lg font-outfit"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit as any)}
            disabled={createSubscriptionMutation.isPending}
            variant="primary"
            className="rounded-lg font-outfit"
          >
            {createSubscriptionMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
              </span>
            ) : "Guardar Suscripción"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
