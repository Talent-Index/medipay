import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockInvoices } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo } from "react";
import { TrendingUp } from "lucide-react";

export default function DoctorReports() {
  const { user } = useAuthStore();

  const metrics = useMemo(() => {
    const my = mockInvoices.filter(inv => inv.doctorId === user?.id);
    const total = my.reduce((s, i) => s + i.amount, 0);
    const paid = my.filter(i => i.status === 'paid' || i.status === 'confirmed').reduce((s, i) => s + i.amount, 0);
    const pending = my.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
    return { count: my.length, total, paid, pending };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Your billing performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Invoices</p>
            <p className="text-2xl font-bold">{metrics.count}</p>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Paid</p>
            <p className="text-2xl font-bold text-paid">${metrics.paid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-pending">${metrics.pending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Simple Trend
          </CardTitle>
          <CardDescription>Mock bar trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-40 flex items-end gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-1 bg-primary/20 rounded" style={{ height: `${20 + ((i * 7) % 60)}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
