import { useMedicalRecords } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PatientMedicalRecords() {
  const navigate = useNavigate();
  const { data: records, isLoading, error } = useMedicalRecords();

  return (
    <div className="p-6 space-y-6">
      <div>
        <Button variant="ghost" onClick={() => navigate('/patient')}>← Back to Dashboard</Button>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Medical Records</CardTitle>
          <CardDescription>Your recent visits and records</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading medical records...</div>}
          {error && <div className="text-destructive">Failed to load medical records.</div>}
          {!isLoading && !error && (
            <div className="space-y-4">
              {(!records || records.length === 0) && (
                <div className="text-muted-foreground">No medical records found.</div>
              )}

              {records && records.map((rec: any) => (
                <div key={rec.id} className="p-4 rounded-lg border border-border">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{new Date(rec.visitDate || rec.createdAt).toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Doctor: {rec.doctor?.name || 'N/A'}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground break-all">
                    Storage: {rec.storageReference}
                  </div>
                  <div className="mt-1 text-sm font-mono break-all">
                    Hash: {rec.encryptedDataHash}
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


