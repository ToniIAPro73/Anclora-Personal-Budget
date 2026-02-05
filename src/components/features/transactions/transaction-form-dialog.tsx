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
import { TransactionForm } from "./transaction-form";

interface TransactionFormDialogProps {
  trigger?: React.ReactNode;
}

export function TransactionFormDialog({ trigger }: TransactionFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary hover:bg-primary/90 rounded-lg">
            <Plus className="h-4 w-4 mr-2" /> Nueva Transacción
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-5 w-5 flex items-center justify-center text-primary">💸</span>
            <span>Registrar Transacción</span>
          </DialogTitle>
          <DialogDescription>
            Añade un nuevo movimiento a tus finanzas de forma rápida.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TransactionForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
