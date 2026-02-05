"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wallet } from "lucide-react";
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
import { accountSchema, type AccountFormData } from "@/lib/form-schemas";
import { useToast } from "@/hooks/use-toast";

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Cuenta Corriente", emoji: "🏦" },
  { value: "SAVINGS", label: "Cuenta de Ahorros", emoji: "💰" },
  { value: "CASH", label: "Efectivo", emoji: "💵" },
  { value: "INVESTMENT", label: "Inversión", emoji: "📈" },
] as const;

const ACCOUNT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export function AccountFormDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema) as any,
    defaultValues: {
      name: "",
      type: "CHECKING",
      currency: "EUR",
      balance: 0,
      color: ACCOUNT_COLORS[0],
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error al crear la cuenta");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({
        title: "✅ Cuenta creada",
        description: "La cuenta se ha creado exitosamente.",
      });
      setOpen(false);
      reset();
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AccountFormData) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Nueva Cuenta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Nueva Cuenta
          </DialogTitle>
          <DialogDescription>
            Crea una nueva cuenta para gestionar tus finanzas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="flex-1 overflow-y-auto px-1">
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                placeholder="Ej: Cuenta Principal"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Cuenta *</Label>
              <Select
                onValueChange={(value: string) => setValue("type", value as any)}
                defaultValue="CHECKING"
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.emoji}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            {/* Balance */}
            <div className="space-y-2">
              <Label htmlFor="balance">Balance Inicial *</Label>
              <CurrencyInput
                id="balance"
                value={watch("balance")}
                onChange={(value: number) => setValue("balance", value)}
                currency={watch("currency")}
              />
              {errors.balance && (
                <p className="text-xs text-destructive">{errors.balance.message}</p>
              )}
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select
                onValueChange={(value) => setValue("currency", value as any)}
                defaultValue="EUR"
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label>Color (opcional)</Label>
              <div className="flex gap-2">
                {ACCOUNT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setValue("color", color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      watch("color") === color
                        ? "border-foreground scale-110"
                        : "border-border hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
            disabled={createAccountMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit as any)}
            disabled={createAccountMutation.isPending}
          >
            {createAccountMutation.isPending ? "Creando..." : "Crear Cuenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
