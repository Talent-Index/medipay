import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Settings } from "lucide-react";

export default function InsuranceSettings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription>Claims processing preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="font-medium">Email notifications</Label>
                <p className="text-sm text-muted-foreground">Updates for claim status changes</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="font-medium">SLA breach alerts</Label>
                <p className="text-sm text-muted-foreground">Notify when processing exceeds SLA</p>
              </div>
              <Switch checked={slaAlerts} onCheckedChange={setSlaAlerts} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
