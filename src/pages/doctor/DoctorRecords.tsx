import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockMedicalRecords } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";

export default function DoctorRecords() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    return mockMedicalRecords.filter(r => r.doctorId === user?.id);
  }, [user?.id]);

  const filtered = rows.filter(r =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Medical Records
          </CardTitle>
          <CardDescription>Patient visits and diagnoses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by patient, diagnosis or record ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map(r => (
                <div key={r.id} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{r.patientName}</p>
                      <p className="text-sm text-muted-foreground">{r.diagnosis} • {new Date(r.visitDate).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{r.institutionName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${r.totalCost.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{r.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
