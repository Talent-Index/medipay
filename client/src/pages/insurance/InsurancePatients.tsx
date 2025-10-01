import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
interface Policy {
    id: string;
    name: string;
}

interface InsurancePayment {
    id: string;
    patientId: string;
    institutionId: string;
    status: 'pending' | 'paid' | 'confirmed';
    amount: number;
    service: string;
    patientName: string;
    institutionName: string;
    processedDate: string;
    claimId: string;
}
import { StatusBadge } from "@/components/ui/status-badge";

interface InsurancePatient {
    id: string;
    name: string;
    email: string;
    phone: string;
    policyId: string;
}

export default function InsurancePatients() {
    const { user } = useAuthStore();

    // State for patients list and search
    const [patients, setPatients] = useState<InsurancePatient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Form state for new patient
    const [newPatient, setNewPatient] = useState({
        name: "",
        email: "",
        phone: "",
        policyId: ""
    });

    // Load initial patients - replace with actual data fetching
    useEffect(() => {
        setPatients([]);
    }, []);

    // Filter patients by search term
    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setNewPatient(prev => ({ ...prev, [field]: value }));
    };

    // Handle adding new patient
    const handleAddPatient = () => {
        if (newPatient.name && newPatient.email && newPatient.policyId) {
            const newId = `PAT-${Date.now()}`;
            const patient: InsurancePatient = {
                id: newId,
                name: newPatient.name,
                email: newPatient.email,
                phone: newPatient.phone,
                policyId: newPatient.policyId
            };
            setPatients(prev => [...prev, patient]);
            setNewPatient({ name: "", email: "", phone: "", policyId: "" });
        }
    };

    // Placeholder datasets (empty until backend integration)
    const policies: Policy[] = [];
    const insurancePayments: InsurancePayment[] = [];

    // Get policy name by id
    const getPolicyName = (policyId: string) => {
        const policy = policies.find(p => p.id === policyId);
        return policy ? policy.name : "Unknown Policy";
    };

    // Get payment status summary for patient
    const getPaymentStatus = (patientId: string) => {
        const payments = insurancePayments.filter(p => p.patientId === patientId);
        if (payments.length === 0) return "No Payments";
        const paidCount = payments.filter(p => p.status === "paid").length;
        return `${paidCount} / ${payments.length} Paid`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="medical-card p-6 bg-gradient-hero text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Patient Management</h1>
                        <p className="text-white/90">Add new patients and assign insurance policies. View and search registered patients and track their payments.</p>
                    </div>
                </div>
            </div>

            {/* Add New Patient Form */}
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Add New Patient</CardTitle>
                    <CardDescription>Enter patient details and assign a policy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newPatient.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Patient Name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newPatient.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                placeholder="patient@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={newPatient.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>
                    <div className="w-64">
                        <Label htmlFor="policy">Assign Policy</Label>
                        <Select
                            value={newPatient.policyId}
                            onValueChange={(value) => handleInputChange("policyId", value)}
                        >
                            <SelectTrigger id="policy" className="w-full">
                                <SelectValue placeholder="Select a policy" />
                            </SelectTrigger>
                            <SelectContent>
                                {policies.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground">No policies available</div>
                                ) : (
                                    policies.map(policy => (
                                        <SelectItem key={policy.id} value={policy.id}>
                                            {policy.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAddPatient} className="bg-gradient-medical" disabled={!newPatient.name || !newPatient.email || !newPatient.policyId}>
                        Add Patient
                    </Button>
                </CardContent>
            </Card>

            {/* Search Patients */}
            <div>
                <Input
                    placeholder="Search patients by name, email, or phone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                />
            </div>

            {/* Patients List */}
            <div className="space-y-4">
                {filteredPatients.length === 0 ? (
                    <Card className="medical-card">
                        <CardContent className="text-center py-12">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                {searchTerm ? "No patients found" : "No patients yet"}
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "Try adjusting your search terms or add a new patient."
                                    : "Get started by adding your first patient to the system."
                                }
                            </p>
                            {!searchTerm && (
                                <Button
                                    onClick={() => document.getElementById('name')?.focus()}
                                    className="bg-gradient-medical"
                                >
                                    Add Your First Patient
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredPatients.map(patient => (
                        <Card key={patient.id} className="medical-card">
                            <CardContent className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{patient.name}</p>
                                    <p className="text-sm text-muted-foreground">{patient.email} | {patient.phone}</p>
                                    <p className="text-sm">Policy: {getPolicyName(patient.policyId)}</p>
                                </div>
                                <div>
                                    <StatusBadge status={getPaymentStatus(patient.id) === "No Payments" ? "pending" : "approved"} />
                                    <p className="text-sm mt-1">{getPaymentStatus(patient.id)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
