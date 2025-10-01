import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useMedicalRecords } from "@/hooks/useApi";
import { FileText, Search } from "lucide-react";

interface MedicalRecordItem {
    id: string;
    diagnosis: string;
    treatment: string;
    visitDate: string;
    patient?: { id: string; name: string };
    institution?: { id: string; name: string };
}

export default function DoctorRecords() {
    const { user } = useAuthStore();
    const [query, setQuery] = useState("");

    // Fetch medical records using the hook
    const { data: records, isLoading, error } = useMedicalRecords();

    const filtered = useMemo(() => {
        if (!query.trim()) return records;
        const q = query.toLowerCase();
        return records.filter((r) =>
            r.diagnosis?.toLowerCase().includes(q) ||
            r.treatment?.toLowerCase().includes(q) ||
            r.patient?.name?.toLowerCase().includes(q)
        );
    }, [records, query]);

    return (
        <div className="space-y-6">
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Medical Records
                    </CardTitle>
                    <CardDescription>View and search records you have created</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="flex gap-2">
                                <Input id="search" placeholder="Search by diagnosis, treatment, patient" value={query} onChange={(e) => setQuery(e.target.value)} />
                                <Button type="button" variant="outline">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:block" />
                    </div>
                </CardContent>
            </Card>

            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Records</CardTitle>
                    <CardDescription>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && (
                        <div className="p-6 text-center text-muted-foreground">Loading records...</div>
                    )}
                    {!isLoading && error && (
                        <div className="p-6 text-center text-destructive">{error.message || 'An error occurred'}</div>
                    )}
                    {!isLoading && !error && filtered.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">No records found.</div>
                    )}
                    {!isLoading && !error && filtered.length > 0 && (
                        <div className="space-y-4">
                            {filtered.map((record) => (
                                <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-semibold">{record.diagnosis || 'Untitled'}</h4>
                                            {record.patient?.name && <Badge variant="outline">{record.patient?.name}</Badge>}
                                            {record.institution?.name && <Badge variant="secondary">{record.institution?.name}</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{record.treatment}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(record.visitDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}


