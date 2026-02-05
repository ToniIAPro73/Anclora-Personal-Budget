"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BudgetForm } from "./budget-form";

interface BudgetFormDialogProps {
  trigger?: React.ReactNode;
}

export function BudgetFormDialog({ trigger }: BudgetFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Presupuesto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-5 w-5 flex items-center justify-center text-primary">💳</span>
            <span>Configurar Presupuesto</span>
          </DialogTitle>
          <DialogDescription>
            Establece límites de gasto para controlar mejor tus finanzas.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <BudgetForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
