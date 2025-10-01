import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Settings } from "lucide-react";

export default function DoctorSettings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings
          </CardTitle>
          <CardDescription>Personal preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="font-medium">Email notifications</Label>
                <p className="text-sm text-muted-foreground">Get updates on new invoices and records</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <Label className="font-medium">Show availability</Label>
                <p className="text-sm text-muted-foreground">Display your schedule to staff</p>
              </div>
              <Switch checked={showAvailability} onCheckedChange={setShowAvailability} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
