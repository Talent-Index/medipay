import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { Settings, Save, User, Building2, Mail, Phone } from "lucide-react";
import { useState } from "react";

export default function InsuranceSettings() {
    const { user } = useAuthStore();
    const [settings, setSettings] = useState({
        companyName: 'HealthCare Plus Insurance',
        email: 'admin@healthcareplus.com',
        phone: '+1 (555) 123-4567',
        address: '123 Insurance Plaza, Medical City, MC 12345',
        description: 'Leading provider of comprehensive health insurance solutions',
        notifications: {
            claimApprovals: true,
            paymentReminders: true,
            policyUpdates: false,
            systemAlerts: true
        },
        autoApproval: {
            enabled: false,
            maxAmount: 500
        }
    });

    const handleSave = () => {
        // Save settings logic would go here
        console.log('Settings saved:', settings);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="medical-card p-6 bg-gradient-hero text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Insurance Settings</h1>
                        <p className="text-white/90">Manage your insurance company settings and preferences</p>
                    </div>
                    <Settings className="w-16 h-16 text-white/80" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Company Information */}
                <Card className="medical-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Company Information
                        </CardTitle>
                        <CardDescription>Update your insurance company details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                value={settings.companyName}
                                onChange={(e) => setSettings(prev => ({ ...prev, companyName: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={settings.phone}
                                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={settings.address}
                                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={settings.description}
                                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="medical-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Notification Preferences
                        </CardTitle>
                        <CardDescription>Configure when you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Claim Approvals</Label>
                                <p className="text-sm text-muted-foreground">Get notified when claims are approved</p>
                            </div>
                            <Switch
                                checked={settings.notifications.claimApprovals}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, claimApprovals: checked }
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Payment Reminders</Label>
                                <p className="text-sm text-muted-foreground">Reminders for pending payments</p>
                            </div>
                            <Switch
                                checked={settings.notifications.paymentReminders}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, paymentReminders: checked }
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Policy Updates</Label>
                                <p className="text-sm text-muted-foreground">Notifications about policy changes</p>
                            </div>
                            <Switch
                                checked={settings.notifications.policyUpdates}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, policyUpdates: checked }
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>System Alerts</Label>
                                <p className="text-sm text-muted-foreground">Important system notifications</p>
                            </div>
                            <Switch
                                checked={settings.notifications.systemAlerts}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({
                                        ...prev,
                                        notifications: { ...prev.notifications, systemAlerts: checked }
                                    }))
                                }
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Automation Settings */}
                <Card className="medical-card">
                    <CardHeader>
                        <CardTitle>Automation Settings</CardTitle>
                        <CardDescription>Configure automatic processing options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Auto-Approval for Claims</Label>
                                <p className="text-sm text-muted-foreground">Automatically approve claims below a certain amount</p>
                            </div>
                            <Switch
                                checked={settings.autoApproval.enabled}
                                onCheckedChange={(checked) =>
                                    setSettings(prev => ({
                                        ...prev,
                                        autoApproval: { ...prev.autoApproval, enabled: checked }
                                    }))
                                }
                            />
                        </div>

                        {settings.autoApproval.enabled && (
                            <div>
                                <Label htmlFor="maxAmount">Maximum Auto-Approval Amount ($)</Label>
                                <Input
                                    id="maxAmount"
                                    type="number"
                                    value={settings.autoApproval.maxAmount}
                                    onChange={(e) =>
                                        setSettings(prev => ({
                                            ...prev,
                                            autoApproval: { ...prev.autoApproval, maxAmount: parseFloat(e.target.value) || 0 }
                                        }))
                                    }
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Account Settings */}
                <Card className="medical-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Account Settings
                        </CardTitle>
                        <CardDescription>Manage your account preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Current User</Label>
                            <p className="text-sm font-medium">{user?.name}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>

                        <div className="pt-4">
                            <Button variant="outline" className="w-full">
                                Change Password
                            </Button>
                        </div>

                        <div>
                            <Button variant="outline" className="w-full">
                                Two-Factor Authentication
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-gradient-medical hover:scale-105 transition-smooth">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                </Button>
            </div>
        </div>
    );
}
