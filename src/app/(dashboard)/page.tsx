"use client";

import { useQuery } from "@tanstack/react-query";
import { RevenueCard } from "@/components/dashboard/revenue-card";
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
    <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-2xl font-bold font-outfit tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Bienvenido de nuevo a tu gestor financiero.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4 flex-shrink-0">
        <BalanceCard balance={data.totalBalance} />
        <RevenueCard />
        <IncomeExpenseCard 
          income={data.monthlyIncome} 
          expenses={data.monthlyExpenses} 
        />
        <Card className="premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Tasa de Ahorro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-outfit">
              {data.monthlyIncome > 0 
                ? (((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100).toFixed(1) 
                : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7 flex-1 min-h-0 overflow-y-auto">
        <Card className="col-span-4 premium-card flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Tendencia de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex-1 min-h-0 overflow-hidden">
            <TrendChart data={data.spendingTrends} />
          </CardContent>
        </Card>
        <Card className="col-span-3 premium-card flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-hidden">
            <SpendingChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-7 flex-shrink-0">
        <Card className="col-span-4 premium-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Presupuestos</CardTitle>
          </CardHeader>
          <CardContent className="max-h-48 overflow-y-auto">
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
