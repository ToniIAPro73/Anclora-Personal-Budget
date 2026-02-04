"use client";

import { AccountList } from "@/components/features/accounts/account-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
// Import AccountForm later

export default function AccountsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit tracking-tight">Cuentas</h2>
          <p className="text-muted-foreground">Gestiona tus cuentas bancarias y efectivo.</p>
        </div>
        <Button variant="primary" size="md">
          <Plus className="h-4 w-4 mr-2" /> Nueva Cuenta
        </Button>
      </div>

      <AccountList />
    </div>
  );
}
