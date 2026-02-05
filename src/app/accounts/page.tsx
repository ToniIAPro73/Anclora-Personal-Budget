"use client";

import { AccountList } from "@/components/features/accounts/account-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Wallet } from "lucide-react";

export default function AccountsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-outfit tracking-tight">Cuentas</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus cuentas bancarias y efectivo.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg">
          <Plus className="h-4 w-4 mr-2" /> Nueva Cuenta
        </Button>
      </div>

      {/* Accounts Grid */}
      <AccountList />

      {/* Quick Actions */}
      <Card className="premium-card">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-2">
            <Button variant="outline" className="rounded-lg justify-start h-auto py-3">
              <Wallet className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium text-sm">Transferencia Entre Cuentas</div>
                <div className="text-xs text-muted-foreground">Mueve dinero entre tus cuentas</div>
              </div>
            </Button>
            <Button variant="outline" className="rounded-lg justify-start h-auto py-3">
              <Wallet className="h-4 w-4 mr-3" />
              <div className="text-left">
                <div className="font-medium text-sm">Reconciliar Cuenta</div>
                <div className="text-xs text-muted-foreground">Sincroniza con tu banco</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
