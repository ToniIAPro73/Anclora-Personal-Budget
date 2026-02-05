"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

export function SpendingChart({ data }: { data: any[] }) {
  if (!data?.length) return <div className="h-[300px] flex items-center justify-center text-muted-foreground italic text-sm">Sin datos de gastos este mes</div>;

  const chartData = data.map((item, index) => ({
    name: item.categoryName,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="42%"
            innerRadius="50%"
            outerRadius="75%"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => formatCurrency(Number(value))}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
