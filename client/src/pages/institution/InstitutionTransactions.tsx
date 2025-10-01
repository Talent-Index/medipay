import { useMemo, useState } from 'react';
import { useUserTransactions } from '@/hooks/useUserTransactions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Filter, Loader2 } from 'lucide-react';

export default function InstitutionTransactions() {
  const { transactions, isLoading, error, refetch } = useUserTransactions();
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState<'all' | 'cash' | 'insurance'>('all');

  const filtered = useMemo(() => {
    return transactions
      .filter(t => t.type === 'invoice' || t.type === 'payment')
      .filter(t => (method === 'all' ? true : t.paymentMethod === method))
      .filter(t => (query ? (t.description?.toLowerCase().includes(query.toLowerCase()) || t.patientName?.toLowerCase().includes(query.toLowerCase()) || t.doctorName?.toLowerCase().includes(query.toLowerCase())) : true));
  }, [transactions, query, method]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><CreditCard className="w-6 h-6" /> Institution Transactions</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Filter className="w-4 h-4" /> Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-3">
          <Input placeholder="Search by description, patient, doctor" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="flex gap-2">
            <Button variant={method === 'all' ? 'default' : 'outline'} onClick={() => setMethod('all')}>All</Button>
            <Button variant={method === 'cash' ? 'default' : 'outline'} onClick={() => setMethod('cash')}>Cash</Button>
            <Button variant={method === 'insurance' ? 'default' : 'outline'} onClick={() => setMethod('insurance')}>Insurance</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((t) => (
          <Card key={t.id}>
            <CardContent className="py-4 flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">{t.description}</div>
                <div className="text-sm text-muted-foreground">{t.patientName || '—'} {t.doctorName ? `• ${t.doctorName}` : ''}</div>
                {t.invoiceDetails && (
                  <div className="text-xs text-muted-foreground">
                    {t.invoiceDetails.serviceDescription} • ${t.invoiceDetails.totalAmount}
                  </div>
                )}
              </div>
              <div className="text-right space-y-2">
                <Badge variant="secondary">{t.status}</Badge>
                {typeof t.amount === 'number' && (
                  <div className="font-semibold">${t.amount.toFixed(2)}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">No transactions found.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


