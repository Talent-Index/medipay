import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockMedicalRecords } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useMemo, useState } from "react";
import { Search, Pill } from "lucide-react";

export default function DoctorPrescriptions() {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  const rows = useMemo(() => {
    const myRecords = mockMedicalRecords.filter(r => r.doctorId === user?.id);
    return myRecords.flatMap(r => r.prescriptions.map(p => ({
      recordId: r.id,
      patientName: r.patientName,
      medicationName: p.medicationName,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      totalPrice: p.totalPrice,
    })));
  }, [user?.id]);

  const filtered = rows.filter(r =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.medicationName.toLowerCase().includes(search.toLowerCase()) ||
    r.recordId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Prescriptions
          </CardTitle>
          <CardDescription>Medications prescribed to your patients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search by patient, medication or record ID" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {filtered.length > 0 ? (
            <div className="space-y-4">
              {filtered.map((p, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.medicationName}</p>
                      <p className="text-sm text-muted-foreground">{p.dosage} • {p.frequency} • {p.duration}</p>
                      <p className="text-xs text-muted-foreground">{p.patientName} • Record {p.recordId}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${p.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Pill className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-medium">No prescriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
