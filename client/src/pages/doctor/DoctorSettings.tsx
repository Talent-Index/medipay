import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";

export default function DoctorSettings() {
    const { user, updateProfile } = useAuthStore();
    const { toast } = useToast();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");

    const onSave = () => {
        updateProfile({ name, email });
        toast({ title: "Profile updated", description: "Your settings have been saved." });
    };

    return (
        <div className="space-y-6">
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Doctor Settings</CardTitle>
                    <CardDescription>Manage your profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div>
                        <Button onClick={onSave}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


