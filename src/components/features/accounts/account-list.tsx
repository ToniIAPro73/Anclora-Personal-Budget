"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CreditCard, Banknote, Landmark, TrendingUp } from "lucide-react";

const icons: Record<string, any> = {
  CHECKING: Landmark,
  SAVINGS: Banknote,
  CREDIT_CARD: CreditCard,
  CASH: Wallet,
  INVESTMENT: TrendingUp,
};

export function AccountList() {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => fetch("/api/accounts").then(res => res.json()),
  });

  if (isLoading) return <div>Cargando cuentas...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts?.map((account: any) => {
        const Icon = icons[account.type] || Wallet;
        return (
          <Card key={account.id} className="hover:border-primary transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
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
