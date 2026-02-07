"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CreditCard, Banknote, Landmark, TrendingUp, MoreHorizontal, Edit, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AccountFormDialog } from "./account-form-dialog";
import { useToast } from "@/hooks/use-toast";

const icons: Record<string, any> = {
  CHECKING: Landmark,
  SAVINGS: Banknote,
  CREDIT_CARD: CreditCard,
  CASH: Wallet,
  INVESTMENT: TrendingUp,
};

export function AccountList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetch("/api/accounts").then(res => res.json()),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la cuenta");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast({ title: "Cuenta desactivada", description: "La cuenta ya no aparecerá en tus balances." });
    },
  });

  if (isLoading) return <div>Cargando cuentas...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts?.map((account: any) => {
        const Icon = icons[account.type] || Wallet;
        return (
          <Card key={account.id} className="hover:border-primary transition-all relative group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <AccountFormDialog initialData={account}>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                    </AccountFormDialog>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onSelect={() => {
                        if (confirm("¿Estás seguro de que quieres eliminar esta cuenta?")) {
                          deleteMutation.mutate(account.id);
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-outfit">{formatCurrency(Number(account.currentBalance), account.currency)}</div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">{account.type.toLowerCase().replace("_", " ")}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
