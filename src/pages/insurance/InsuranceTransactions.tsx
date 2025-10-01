import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockInsurancePayments } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, Shield } from "lucide-react";

export default function InsuranceTransactions() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    // Demo: show all payments; filter by institutionId or patient as needed
    return mockInsurancePayments;
  }, [user?.id]);

  const filtered = rows.filter(r =>
    r.service.toLowerCase().includes(search.toLowerCase()) ||
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.institutionName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Insurance Transactions
          </CardTitle>
          <CardDescription>Processed claims and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by patient, institution, service, or ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(p => (
                <div key={p.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="font-semibold">{p.service}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.patientName} • {p.institutionName} • {new Date(p.processedDate).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${p.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{p.status.toUpperCase()} • {p.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
