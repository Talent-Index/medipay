import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
interface Transaction {
  id: string;
  invoiceId: string;
  patientName: string;
  doctorName: string;
  service: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed' | 'approved' | 'partially_paid';
  timestamp: string;
  blockchainHash?: string;
  proofOfStake?: string;
}
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useUserTransactions } from "@/hooks/useUserTransactions";
import {
  CreditCard,
  Search,
  Filter,
  Calendar,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

export default function PatientTransactions() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch transactions using the hook
  const { transactions: userTransactionsData, isLoading, error } = useUserTransactions();

  // Map UserTransaction to Transaction interface
  const userTransactions: Transaction[] = userTransactionsData.map(tx => ({
    id: tx.id,
    invoiceId: tx.relatedId || '',
    patientName: tx.patientName || '',
    doctorName: tx.doctorName || '',
    service: tx.description,
    amount: tx.amount || 0,
    status: tx.status, // Use the actual status from the hook
    timestamp: new Date(tx.timestamp).toISOString(),
    blockchainHash: tx.blockchainHash,
    proofOfStake: undefined // Not available in UserTransaction
  }));

  // Filter by search term and status
  const filteredTransactions = userTransactions.filter(transaction => {
    const matchesSearch = transaction.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Hash Copied",
      description: "Transaction hash copied to clipboard.",
    });
  };

  const handleViewOnExplorer = (hash: string) => {
    const explorerUrl = `https://suiexplorer.com/txblock/${hash}?network=testnet`;
    window.open(explorerUrl, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Transactions</h2>
          <p className="text-muted-foreground">
            View your blockchain transaction history
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="medical-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="approved">Approved</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="medical-card border-destructive">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Transactions</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        {!isLoading && !error && filteredTransactions.length > 0 ? (
          filteredTransactions.map((transaction) => (
            <Card key={transaction.id} className="medical-card transition-smooth hover:shadow-medical">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{transaction.service}</h3>
                      <StatusBadge status={transaction.status} />
                      {getStatusIcon(transaction.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Transaction ID: {transaction.id}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div>
                        Doctor: {transaction.doctorName}
                      </div>
                      <div>
                        Invoice: {transaction.invoiceId}
                      </div>
                    </div>

                    {/* Blockchain Information */}
                    {transaction.blockchainHash && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Blockchain Hash</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyHash(transaction.blockchainHash!)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOnExplorer(transaction.blockchainHash!)}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <code className="text-xs text-muted-foreground break-all">
                          {transaction.blockchainHash}
                        </code>
                        {transaction.proofOfStake && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">PoS Proof: </span>
                            <code className="text-xs text-muted-foreground">
                              {transaction.proofOfStake}
                            </code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">${transaction.amount}</p>
                    <p className="text-sm text-muted-foreground">Amount</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="medical-card">
            <CardContent className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Your transaction history will appear here once you make payments."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
