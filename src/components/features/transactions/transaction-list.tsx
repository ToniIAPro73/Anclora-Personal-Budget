import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreHorizontal,
  ReceiptText
} from "lucide-react";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TransactionListProps {
  transactions: any[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <ReceiptText className="h-12 w-12 mb-4 opacity-20" />
          <p>No se encontraron transacciones.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <Card key={tx.id} className="overflow-hidden hover:border-primary/50 transition-colors">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 px-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  tx.type === "INCOME" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                  {tx.type === "INCOME" ? <ArrowUpCircle className="h-5 w-5" /> : <ArrowDownCircle className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)} • {tx.account.name} • {tx.category?.name || "Sin categoría"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className={cn(
                  "text-lg font-bold font-outfit",
                  tx.type === "INCOME" ? "text-success" : "text-foreground"
                )}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(tx.amount)}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
