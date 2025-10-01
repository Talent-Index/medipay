import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import { FilePlus } from "lucide-react";

export default function DoctorCreateInvoice() {
  const { user } = useAuthStore();
  const [patientName, setPatientName] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [preview, setPreview] = useState<null | { patientName: string; service: string; amount: number; doctorName: string; notes?: string }>(null);

  const onPreview = () => {
    const amt = Number(amount);
    if (!patientName || !service || isNaN(amt) || amt <= 0) return;
    setPreview({ patientName, service, amount: amt, doctorName: user?.name || "", notes });
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePlus className="w-5 h-5" />
            Create Invoice
          </CardTitle>
          <CardDescription>Draft a new invoice for a patient</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Patient Name</Label>
              <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="John Smith" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Service</Label>
              <Input value={service} onChange={e => setService(e.target.value)} placeholder="General Consultation" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Amount</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150" />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Notes</Label>
              <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={onPreview} className="bg-gradient-medical">Preview</Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Invoice Preview</CardTitle>
            <CardDescription>Not persisted in demo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Patient</p>
                <p className="font-medium">{preview.patientName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Doctor</p>
                <p className="font-medium">{preview.doctorName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Service</p>
                <p className="font-medium">{preview.service}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-medium">${preview.amount.toFixed(2)}</p>
              </div>
              {preview.notes && (
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="font-medium">{preview.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
