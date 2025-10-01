import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useInvoices } from "@/hooks/useApi";
import {
  CreditCard,
  FileText,
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function PatientDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch invoices using the hook
  const { data: invoices, isLoading, error } = useInvoices();

  // Filter invoices for current user
  const userInvoices = (invoices || []).filter(invoice => invoice.patientId === user?.id);
  const recentInvoices = userInvoices.slice(0, 3);

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
          {isLoading ? (
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
          ) : error ? (
            <Card className="medical-card border-destructive">
              <CardContent className="p-6 text-center">
                <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Error Loading Invoices</h3>
                <p className="text-muted-foreground">{error.message || 'An error occurred'}</p>
              </CardContent>
            </Card>
          ) : recentInvoices.length > 0 ? (
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
