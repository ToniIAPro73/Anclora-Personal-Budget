"use client";

import { useQuery } from "@tanstack/react-query";
import { BalanceCard } from "@/components/features/dashboard/balance-card";
import { IncomeExpenseCard } from "@/components/features/dashboard/income-expense-card";
import { SpendingChart } from "@/components/features/dashboard/spending-chart";
import { TrendChart } from "@/components/features/dashboard/trend-chart";
import { BudgetProgressList } from "@/components/features/dashboard/budget-progress-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data, isLoading } = useQuery<any>({
    queryKey: ["dashboard-overview"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/overview");
      return res.json();
    },
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold font-outfit tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Bienvenido de nuevo a tu gestor financiero.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BalanceCard balance={data.totalBalance} />
        <IncomeExpenseCard 
          income={data.monthlyIncome} 
          expenses={data.monthlyExpenses} 
        />
        {/* Placeholder for Goals or Next Payment */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Ahorro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-outfit">
              {data.monthlyIncome > 0 
                ? (((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100).toFixed(1) 
                : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tendencia de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <TrendChart data={data.spendingTrends} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Presupuestos</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetProgressList budgets={data.budgets} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
    return <div className="p-8 space-y-4">Cargando dashboard...</div>;
}
