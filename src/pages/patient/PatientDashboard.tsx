import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { mockInvoices, mockTransactions, mockMedicalRecords } from "@/data/mockData";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  FileText, 
  Activity, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  User,
  Shield,
} from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Filter invoices and transactions for current user
  const userInvoices = mockInvoices.filter(invoice => invoice.patientId === user?.id);
  const recentInvoices = userInvoices.slice(0, 3);
  const userTransactions = mockTransactions
    .filter(txn => userInvoices.some(inv => inv.id === txn.invoiceId))
    .slice(0, 5);

  // Last visit from medical records
  const userRecords = mockMedicalRecords.filter(r => r.patientId === user?.id);
  const lastVisit = userRecords
    .slice()
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];

  // Calculate stats
  const totalAmount = userInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = userInvoices
    .filter(invoice => invoice.status === 'paid' || invoice.status === 'confirmed')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = userInvoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const stats = [
    {
      title: "Total Invoices",
      value: userInvoices.length.toString(),
      icon: FileText,
      description: "All time",
      color: "text-primary"
    },
    {
      title: "Paid Amount",
      value: `$${paidAmount.toLocaleString()}`,
      icon: CheckCircle,
      description: "Successfully paid",
      color: "text-paid"
    },
    {
      title: "Pending Amount",
      value: `$${pendingAmount.toLocaleString()}`,
      icon: Clock,
      description: "Awaiting payment",
      color: "text-pending"
    },
    {
      title: "Total Healthcare",
      value: `$${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      description: "Total spending",
      color: "text-confirmed"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="medical-card p-6 bg-gradient-hero text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-white/90">
              Manage your medical payments and track your healthcare expenses
            </p>
          </div>
          <Activity className="w-16 h-16 text-white/80" />
        </div>
      </div>

      {/* Profile Summary + Last Visit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Summary
            </CardTitle>
            <CardDescription>Your personal and account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Invoices</p>
                <p className="font-medium">{userInvoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Last Visit
            </CardTitle>
            <CardDescription>Your most recent medical visit</CardDescription>
          </CardHeader>
          <CardContent>
            {lastVisit ? (
              <div className="space-y-2 text-sm">
                <p className="font-medium">{lastVisit.institutionName}</p>
                <p className="text-muted-foreground">{lastVisit.doctorName} • {new Date(lastVisit.visitDate).toLocaleString()}</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-muted-foreground">Diagnosis</p>
                    <p className="font-medium">{lastVisit.diagnosis}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Treatment</p>
                    <p className="font-medium">{lastVisit.treatment}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Insurance Coverage</p>
                    <p className="font-medium">${lastVisit.insuranceCoverage.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">You Owe</p>
                    <p className="font-medium">${lastVisit.patientResponsibility.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No visit records yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="medical-card transition-smooth hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>
                Your latest blockchain-verified payments
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/patient/transactions')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {userTransactions.length > 0 ? (
            <div className="space-y-4">
              {userTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{transaction.service}</h4>
                      <StatusBadge status={transaction.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.timestamp).toLocaleString()} • {transaction.doctorName}
                    </p>
                    {transaction.blockchainHash && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        Hash: {transaction.blockchainHash}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${transaction.amount}</p>
                    <p className="text-sm text-muted-foreground">{transaction.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No transactions yet</p>
              <p className="text-muted-foreground">
                Your transactions will appear here as you make payments
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Invoices
              </CardTitle>
              <CardDescription>
                Your latest medical bills and payment status
              </CardDescription>
            </div>
            <Button 
              variant="outline"
              onClick={() => navigate('/patient/invoices')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentInvoices.length > 0 ? (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{invoice.service}</h4>
                      <StatusBadge status={invoice.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {invoice.doctorName} • {new Date(invoice.createdAt).toLocaleDateString()}
                    </p>
                    {invoice.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {invoice.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${invoice.amount}</p>
                    {invoice.status === 'pending' && (
                      <Button size="sm" className="mt-2">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No invoices yet</p>
              <p className="text-muted-foreground">
                Your medical invoices will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment options
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gradient-medical flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Crypto Wallet</p>
                    <p className="text-sm text-muted-foreground">0x1234...5678</p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">Primary</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks and features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/patient/transactions')}
              >
                <Activity className="w-4 h-4" />
                View Transaction History
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/patient/profile')}
              >
                <FileText className="w-4 h-4" />
                Update Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => navigate('/transactions')}
              >
                <TrendingUp className="w-4 h-4" />
                Explore Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}