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
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-3 overflow-hidden">
      {/* Header - minimal height */}
      <div className="flex-shrink-0">
        <h2 className="text-xl font-bold font-outfit tracking-tight">Dashboard</h2>
        <p className="text-xs text-muted-foreground">Bienvenido de nuevo a tu gestor financiero.</p>
      </div>

      {/* Stats Cards - Responsive auto-fit grid, compact height */}
      <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(180px,1fr))] flex-shrink-0">
        <BalanceCard balance={data.totalBalance} />
        <RevenueCard />
        <IncomeExpenseCard 
          income={data.monthlyIncome} 
          expenses={data.monthlyExpenses} 
        />
        <Card className="premium-card">
          <CardHeader className="pb-1 pt-3">
            <CardTitle className="text-xs font-medium">Tasa de Ahorro</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="text-lg lg:text-xl font-bold font-outfit">
              {data.monthlyIncome > 0 
                ? (((data.monthlyIncome - data.monthlyExpenses) / data.monthlyIncome) * 100).toFixed(1) 
                : "0"}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Reduced height to fit better */}
      <div className="grid gap-2 grid-cols-1 lg:grid-cols-2 h-[28vh] flex-shrink-0">
        <Card className="premium-card h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-1 pt-3 flex-shrink-0">
            <CardTitle className="text-sm">Tendencia de Gastos</CardTitle>
          </CardHeader>
          <CardContent className="pl-2 flex-1 min-h-[180px] flex items-center justify-center overflow-hidden">
            <TrendChart data={data.spendingTrends} />
          </CardContent>
        </Card>
        <Card className="premium-card h-full flex flex-col overflow-hidden">
          <CardHeader className="pb-1 pt-3 flex-shrink-0">
            <CardTitle className="text-sm">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[200px] flex items-center justify-center overflow-hidden">
            <SpendingChart data={data.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Budgets - Remaining space, no scroll */}
      <Card className="premium-card flex-1 flex flex-col overflow-hidden min-h-0">
        <CardHeader className="pb-1 pt-3 flex-shrink-0">
          <CardTitle className="text-sm">Presupuestos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto min-h-0">
          <BudgetProgressList budgets={data.budgets} />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
    return <div className="p-8 space-y-4">Cargando dashboard...</div>;
}
