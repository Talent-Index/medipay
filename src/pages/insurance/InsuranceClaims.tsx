import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockInsurancePayments } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useInvoice } from "@/hooks/useInvoice";
import { FileText, Search, Filter, Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";

export default function InsuranceClaims() {
    const { user } = useAuthStore();
    const { approveInvoiceByInsurance, isLoading } = useInvoice();
    const [filter, setFilter] = useState('all');
    const [approvingClaim, setApprovingClaim] = useState<string | null>(null);

    // Filter claims for current insurance company
    const claims = mockInsurancePayments.filter(payment => payment.id.includes('IP'));

    const filteredClaims = claims.filter(claim => {
        if (filter === 'all') return true;
        return claim.status === filter;
    });

    const mapStatus = (status: 'pending' | 'paid' | 'confirmed'): "pending" | "confirmed" | "failed" | "approved" | "partially_paid" => {
        switch (status) {
            case 'paid':
                return 'approved';
            case 'confirmed':
                return 'confirmed';
            case 'pending':
                return 'pending';
            default:
                return 'pending';
        }
    };

    const handleApproveClaim = async (claim: any) => {
        setApprovingClaim(claim.id);
        // In a real implementation, we would need the insurance capability ID and invoice ID
        // For now, we'll use mock data and show the functionality
        const mockInsuranceCapId = "0x1234567890abcdef"; // This would come from user's insurance capability
        const mockInvoiceId = claim.id; // This would be the actual invoice ID
        const mockClaimId = claim.claimId;

        try {
            await approveInvoiceByInsurance(mockInsuranceCapId, mockInvoiceId, mockClaimId);
            // In a real app, this would update the local state or refetch data
        } catch (error) {
            console.error('Failed to approve claim:', error);
        } finally {
            setApprovingClaim(null);
        }
    };

    const stats = [
        { label: 'Total Claims', value: claims.length, color: 'text-primary' },
        { label: 'Approved', value: claims.filter(c => c.status === 'paid' || c.status === 'confirmed').length, color: 'text-paid' },
        { label: 'Pending', value: claims.filter(c => c.status === 'pending').length, color: 'text-pending' }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="medical-card p-6 bg-gradient-hero text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Insurance Claims</h1>
                        <p className="text-white/90">Review and manage all insurance claims</p>
                    </div>
                    <FileText className="w-16 h-16 text-white/80" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="medical-card">
                        <CardContent className="p-6 text-center">
                            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters and Search */}
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Claims Management</CardTitle>
                    <CardDescription>Filter and search through insurance claims</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All Claims
                        </Button>
                        <Button
                            variant={filter === 'pending' ? 'default' : 'outline'}
                            onClick={() => setFilter('pending')}
                        >
                            Pending
                        </Button>
                        <Button
                            variant={filter === 'paid' ? 'default' : 'outline'}
                            onClick={() => setFilter('paid')}
                        >
                            Approved
                        </Button>

                    </div>

                    {/* Claims List */}
                    <div className="space-y-4">
                        {filteredClaims.length === 0 ? (
                            <div className="text-center p-12 text-muted-foreground">
                                No claims found.
                            </div>
                        ) : (
                            filteredClaims.map((claim) => (
                                <div key={claim.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold">{claim.service}</h4>
                                            <StatusBadge status={mapStatus(claim.status)} />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Patient: {claim.patientName} • Institution: {claim.institutionName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Claim ID: {claim.claimId} • Submitted: {new Date(claim.processedDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-bold text-lg">${claim.amount}</p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            {claim.status === 'pending' && (
                                                <>
                                                    <Button size="sm" className="bg-paid hover:bg-paid/90">
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="destructive">
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
