import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockInvoices } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";

export default function DoctorInvoices() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return mockInvoices.filter(inv => inv.doctorId === user?.id);
  }, [user?.id]);

  const filtered = rows.filter(r =>
    r.service.toLowerCase().includes(search.toLowerCase()) ||
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Invoices
          </CardTitle>
          <CardDescription>Invoices created for your patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by patient, service, or ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(inv => (
                <div key={inv.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-semibold">{inv.service}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {inv.patientName} • {new Date(inv.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${inv.amount}</p>
                      <p className="text-xs text-muted-foreground">{inv.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No invoices found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
