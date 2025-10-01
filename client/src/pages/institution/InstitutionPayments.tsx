import { useMemo } from 'react';
import { useUserTransactions } from '@/hooks/useUserTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function InstitutionPayments() {
  const { transactions, isLoading } = useUserTransactions();
  const insurancePayments = useMemo(() => transactions.filter(t => t.type === 'payment' && t.paymentMethod === 'insurance'), [transactions]);

  const total = insurancePayments.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold flex items-center gap-2"><Shield className="w-6 h-6" /> Insurance Payments</h1>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Payments</div>
            <div className="text-2xl font-semibold">{insurancePayments.length}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Amount</div>
            <div className="text-2xl font-semibold">${total.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="text-2xl font-semibold">{isLoading ? 'Loading…' : 'Up to date'}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {insurancePayments.map(p => (
          <Card key={p.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{p.description}</div>
                <div className="text-sm text-muted-foreground">{p.patientName || '—'} {p.doctorName ? `• ${p.doctorName}` : ''}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">${(p.amount || 0).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{new Date(p.timestamp).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && insurancePayments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">No insurance payments found.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


