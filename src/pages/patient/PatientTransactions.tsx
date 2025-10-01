import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockInvoices, mockTransactions } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";

export default function PatientTransactions() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const userTransactions = useMemo(() => {
    const userInvoiceIds = new Set(
      mockInvoices
        .filter(inv => inv.patientId === user?.id)
        .map(inv => inv.id)
    );
    return mockTransactions.filter(txn => userInvoiceIds.has(txn.invoiceId));
  }, [user?.id]);

  const filtered = userTransactions.filter(txn =>
    txn.service.toLowerCase().includes(search.toLowerCase()) ||
    txn.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    txn.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Your Transactions
          </CardTitle>
          <CardDescription>Blockchain-verified payments and statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by service, doctor or ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setSearch("")}>Clear</Button>
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(txn => (
                <div key={txn.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{txn.service}</p>
                        <StatusBadge status={txn.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {txn.doctorName} • {new Date(txn.timestamp).toLocaleString()}
                      </p>
                      {txn.blockchainHash && (
                        <p className="text-xs font-mono text-muted-foreground mt-1">Hash: {txn.blockchainHash}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${txn.amount}</p>
                      <p className="text-xs text-muted-foreground">{txn.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No matching transactions</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
