import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/authStore";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";

interface Policy {
    id: string;
    name: string;
    description: string;
    services: { service: string; coverageAmount: number }[];
    premium: number;
    active: boolean;
}

export default function InsurancePolicies() {
    const { user } = useAuthStore();
    const [policies, setPolicies] = useState<Policy[]>([
        {
            id: 'POL-001',
            name: 'Basic Health Coverage',
            description: 'Standard health insurance coverage for common medical services',
            services: [
                { service: 'General Consultation', coverageAmount: 120 },
                { service: 'Blood Test', coverageAmount: 68 },
                { service: 'X-Ray', coverageAmount: 80 }
            ],
            premium: 150,
            active: true
        }
    ]);

    const [isCreating, setIsCreating] = useState(false);
    const [newPolicy, setNewPolicy] = useState({
        name: '',
        description: '',
        premium: 0,
        services: [{ service: '', coverageAmount: 0 }]
    });

    const handleCreatePolicy = () => {
        if (newPolicy.name && newPolicy.description) {
            const policy: Policy = {
                id: `POL-${Date.now()}`,
                name: newPolicy.name,
                description: newPolicy.description,
                services: newPolicy.services.filter(s => s.service && s.coverageAmount > 0),
                premium: newPolicy.premium,
                active: true
            };
            setPolicies([...policies, policy]);
            setNewPolicy({ name: '', description: '', premium: 0, services: [{ service: '', coverageAmount: 0 }] });
            setIsCreating(false);
        }
    };

    const addService = () => {
        setNewPolicy(prev => ({
            ...prev,
            services: [...prev.services, { service: '', coverageAmount: 0 }]
        }));
    };

    const updateService = (index: number, field: string, value: string | number) => {
        setNewPolicy(prev => ({
            ...prev,
            services: prev.services.map((s, i) =>
                i === index ? { ...s, [field]: value } : s
            )
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="medical-card p-6 bg-gradient-hero text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Insurance Policies</h1>
                        <p className="text-white/90">Create and manage insurance policies and coverage amounts</p>
                    </div>
                    <Shield className="w-16 h-16 text-white/80" />
                </div>
            </div>

            {/* Create Policy Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Policy Management</h2>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-gradient-medical hover:scale-105 transition-smooth"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Policy
                </Button>
            </div>

            {/* Create Policy Form */}
            {isCreating && (
                <Card className="medical-card">
                    <CardHeader>
                        <CardTitle>Create New Policy</CardTitle>
                        <CardDescription>Define coverage amounts for different medical services</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="policyName">Policy Name</Label>
                                <Input
                                    id="policyName"
                                    value={newPolicy.name}
                                    onChange={(e) => setNewPolicy(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Premium Health Coverage"
                                />
                            </div>
                            <div>
                                <Label htmlFor="premium">Monthly Premium ($)</Label>
                                <Input
                                    id="premium"
                                    type="number"
                                    value={newPolicy.premium}
                                    onChange={(e) => setNewPolicy(prev => ({ ...prev, premium: parseFloat(e.target.value) || 0 }))}
                                    placeholder="150"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newPolicy.description}
                                onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe the policy coverage..."
                            />
                        </div>

                        <div>
                            <Label>Service Coverage</Label>
                            <div className="space-y-4 mt-2">
                                {newPolicy.services.map((service, index) => (
                                    <div key={index} className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <Label>Service Name</Label>
                                            <Input
                                                value={service.service}
                                                onChange={(e) => updateService(index, 'service', e.target.value)}
                                                placeholder="e.g., General Consultation"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <Label>Coverage ($)</Label>
                                            <Input
                                                type="number"
                                                value={service.coverageAmount}
                                                onChange={(e) => updateService(index, 'coverageAmount', parseFloat(e.target.value) || 0)}
                                                placeholder="120"
                                            />
                                        </div>
                                        {newPolicy.services.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setNewPolicy(prev => ({
                                                    ...prev,
                                                    services: prev.services.filter((_, i) => i !== index)
                                                }))}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" onClick={addService}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Service
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button onClick={handleCreatePolicy} className="bg-gradient-medical">
                                Create Policy
                            </Button>
                            <Button variant="outline" onClick={() => setIsCreating(false)}>
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Policies List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {policies.map((policy) => (
                    <Card key={policy.id} className="medical-card">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        {policy.name}
                                    </CardTitle>
                                    <CardDescription>{policy.description}</CardDescription>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">${policy.premium}</p>
                                    <p className="text-sm text-muted-foreground">Monthly Premium</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <h4 className="font-semibold">Covered Services:</h4>
                                <div className="space-y-2">
                                    {policy.services.map((service, index) => (
                                        <div key={index} className="flex justify-between items-center p-2 rounded bg-accent/50">
                                            <span className="text-sm">{service.service}</span>
                                            <span className="font-semibold">${service.coverageAmount}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 pt-4">
                                    <Button size="sm" variant="outline">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button size="sm" variant="outline">
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
