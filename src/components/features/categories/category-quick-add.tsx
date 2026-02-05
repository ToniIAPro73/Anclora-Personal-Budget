"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(["INCOME", "EXPENSE"]),
});

type CategoryValues = z.infer<typeof categorySchema>;

interface CategoryQuickAddProps {
  type: "INCOME" | "EXPENSE";
  onSuccess?: (categoryId: string) => void;
}

export function CategoryQuickAdd({ type, onSuccess }: CategoryQuickAddProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      type: type,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CategoryValues) =>
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Categoría creada", description: `"${data.name}" se ha añadido correctamente.` });
      reset();
      setOpen(false);
      onSuccess?.(data.id);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: "No se pudo crear la categoría.", variant: "destructive" });
    }
  });

  const onSubmit = (data: CategoryValues) => mutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Categoría ({type === "INCOME" ? "Ingreso" : "Gasto"})</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input
              id="name"
              placeholder="Ej: Alimentación, Salario..."
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {mutation.isPending ? "Creando..." : "Añadir"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
