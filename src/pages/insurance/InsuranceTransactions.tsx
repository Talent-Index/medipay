import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockTransactions } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import { CreditCard, Eye, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";

export default function InsuranceTransactions() {
    const { user } = useAuthStore();
    const [filter, setFilter] = useState('all');

    // Filter transactions related to insurance
    const transactions = mockTransactions.filter(transaction =>
        transaction.service.includes('Consultation') || transaction.service.includes('Test') || transaction.service.includes('Cardiology')
    );

    const filteredTransactions = transactions.filter(transaction => {
        if (filter === 'all') return true;
        return transaction.status === filter;
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

    const stats = [
        { label: 'Total Transactions', value: transactions.length, color: 'text-primary' },
        { label: 'Completed', value: transactions.filter(t => t.status === 'paid' || t.status === 'confirmed').length, color: 'text-paid' },
        { label: 'Pending', value: transactions.filter(t => t.status === 'pending').length, color: 'text-pending' },
        { label: 'Total Value', value: `$${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}`, color: 'text-confirmed' }
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="medical-card p-6 bg-gradient-hero text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Patient Transactions</h1>
                        <p className="text-white/90">Monitor transactions related to insurance-covered services</p>
                    </div>
                    <CreditCard className="w-16 h-16 text-white/80" />
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

            {/* Filters */}
            <Card className="medical-card">
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View and filter patient transactions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-6">
                        <Button
                            variant={filter === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilter('all')}
                        >
                            All Transactions
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
                            Completed
                        </Button>
                        <Button
                            variant={filter === 'confirmed' ? 'default' : 'outline'}
                            onClick={() => setFilter('confirmed')}
                        >
                            Confirmed
                        </Button>
                    </div>

                    {/* Transactions List */}
                    <div className="space-y-4">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold">{transaction.service}</h4>
                                        <StatusBadge status={mapStatus(transaction.status)} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Patient: {transaction.patientName} • Doctor: {transaction.doctorName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Transaction ID: {transaction.id} • {new Date(transaction.timestamp).toLocaleDateString()}
                                    </p>
                                    {transaction.blockchainHash && (
                                        <p className="text-xs text-muted-foreground">
                                            Blockchain: {transaction.blockchainHash.slice(0, 10)}...
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="font-bold text-lg">${transaction.amount}</p>
                                    <Button size="sm" variant="outline">
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
