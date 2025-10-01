import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { Pill, Search } from "lucide-react";

interface PrescriptionItem {
    id: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration?: string;
    quantity?: number;
    createdAt?: string;
    patient?: { id: string; name: string };
}

export default function DoctorPrescriptions() {
    const { user } = useAuthStore();
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<PrescriptionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            if (!user?.address) return;
            setLoading(true);
            setError(null);
            try {
                const res = await api.prescriptions.list(user.address);
                const data = (res?.data as any[]) || [];
                setItems(data as PrescriptionItem[]);
            } catch (e: any) {
                setError(e?.message || "Failed to load prescriptions");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user?.address]);

    const filtered = useMemo(() => {
        if (!query.trim()) return items;
        const q = query.toLowerCase();
        return items.filter((p) =>
            p.medicationName?.toLowerCase().includes(q) ||
            p.dosage?.toLowerCase().includes(q) ||
            p.patient?.name?.toLowerCase().includes(q)
        );
    }, [items, query]);

    return (
        <div className="space-y-6">
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Pill className="w-5 h-5" />
                        Prescriptions
                    </CardTitle>
                    <CardDescription>View and search prescriptions you have issued</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-2">
                            <Label htmlFor="search">Search</Label>
                            <div className="flex gap-2">
                                <Input id="search" placeholder="Search by medication, dosage, patient" value={query} onChange={(e) => setQuery(e.target.value)} />
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
                    <CardTitle>Issued Prescriptions</CardTitle>
                    <CardDescription>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && (
                        <div className="p-6 text-center text-muted-foreground">Loading prescriptions...</div>
                    )}
                    {!loading && error && (
                        <div className="p-6 text-center text-destructive">{error}</div>
                    )}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground">No prescriptions found.</div>
                    )}
                    {!loading && !error && filtered.length > 0 && (
                        <div className="space-y-4">
                            {filtered.map((p) => (
                                <div key={p.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-semibold">{p.medicationName || 'Untitled'}</h4>
                                            {p.patient?.name && <Badge variant="outline">{p.patient?.name}</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{p.dosage} • {p.frequency}</p>
                                        {p.duration && <p className="text-sm text-muted-foreground">Duration: {p.duration}</p>}
                                        {p.createdAt && <p className="text-sm text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>}
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


