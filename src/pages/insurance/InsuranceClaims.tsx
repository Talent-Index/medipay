import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mockInsurancePayments } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";

export default function InsuranceClaims() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return mockInsurancePayments;
  }, [user?.id]);

  const filtered = rows.filter(r =>
    r.service.toLowerCase().includes(search.toLowerCase()) ||
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.institutionName.toLowerCase().includes(search.toLowerCase()) ||
    r.claimId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Claims</h1>
          <p className="text-muted-foreground">Submitted and processed insurance claims</p>
        </div>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Claims
          </CardTitle>
          <CardDescription>Filter and review claim statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by patient, institution, service, or claim ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(c => (
                <div key={c.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{c.service}</p>
                      <p className="text-sm text-muted-foreground">
                        Claim {c.claimId} • {c.patientName} • {c.institutionName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${c.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{c.status.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No claims found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
