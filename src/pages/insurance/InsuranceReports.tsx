import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInsurancePayments } from "@/data/mockData";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

export default function InsuranceReports() {
  const totals = useMemo(() => {
    const total = mockInsurancePayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = mockInsurancePayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const processed = mockInsurancePayments.length;
    const successRate = processed > 0 ? Math.round((mockInsurancePayments.filter(p => p.status === 'paid').length / processed) * 100) : 0;
    return { total, paid, processed, successRate };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground">Overview of claims and payouts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Processed</p>
            <p className="text-2xl font-bold">{totals.processed}</p>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Total Payout</p>
            <p className="text-2xl font-bold text-paid">${totals.paid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">All Claims Amount</p>
            <p className="text-2xl font-bold text-primary">${totals.total.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Success Rate</p>
            <p className="text-2xl font-bold text-confirmed">{totals.successRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Monthly Trend
          </CardTitle>
          <CardDescription>Simple aggregated trend (mock)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-end gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded" style={{ height: `${20 + i * 8}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
