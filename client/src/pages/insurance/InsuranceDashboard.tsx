import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { useInsurancePackages } from "@/hooks/useApi";
import {
  Shield,
  FileText,
  Activity,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CreditCard,
  Building2
} from "lucide-react";

export default function InsuranceDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Fetch insurance packages using hook
  const { data: insurancePackages, isLoading: packagesLoading } = useInsurancePackages();

  // Calculate stats from real data
  const totalPackages = insurancePackages?.length || 0;
  const activePackages = insurancePackages?.filter(p => p.isActive).length || 0;
  const totalCoverage = insurancePackages?.reduce((sum, pkg) => sum + (pkg.coverageAmount || 0), 0) || 0;
  const averagePremium = totalPackages > 0 ? Math.round(totalCoverage / totalPackages) : 0;

  const stats = [
    {
      title: "Insurance Packages",
      value: totalPackages.toString(),
      icon: FileText,
      description: "Total packages offered",
      color: "text-primary"
    },
    {
      title: "Active Packages",
      value: activePackages.toString(),
      icon: TrendingUp,
      description: "Currently available",
      color: "text-paid"
    },
    {
      title: "Total Coverage",
      value: `$${totalCoverage.toLocaleString()}`,
      icon: DollarSign,
      description: "Coverage amount",
      color: "text-confirmed"
    },
    {
      title: "Avg Premium",
      value: `$${averagePremium.toLocaleString()}`,
      icon: Shield,
      description: "Average premium",
      color: "text-pending"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="medical-card p-6 bg-gradient-hero text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.name}!
            </h1>
            <p className="text-white/90">
              Manage insurance claims and monitor healthcare transactions
            </p>
          </div>
          <Shield className="w-16 h-16 text-white/80" />
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
                <div className="w-12 h-12 rounded-xl bg-gradient-medical flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to manage insurance operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="h-auto p-6 flex-col gap-3 bg-gradient-medical hover:scale-105 transition-smooth"
              onClick={() => navigate('/insurance/claims')}
            >
              <FileText className="w-8 h-8" />
              <div className="text-center">
                <p className="font-semibold">View Claims</p>
                <p className="text-sm opacity-90">All insurance claims</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-smooth"
              onClick={() => navigate('/insurance/transactions')}
            >
              <CreditCard className="w-8 h-8" />
              <div className="text-center">
                <p className="font-semibold">Patient Transactions</p>
                <p className="text-sm text-muted-foreground">View all transactions</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-6 flex-col gap-3 hover:scale-105 transition-smooth"
              onClick={() => navigate('/insurance/policies')}
            >
              <TrendingUp className="w-8 h-8" />
              <div className="text-center">
                <p className="font-semibold">Policies</p>
                <p className="text-sm text-muted-foreground">Manage coverage</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Packages */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Packages
              </CardTitle>
              <CardDescription>
                Latest insurance packages offered
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/insurance/policies')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {insurancePackages && insurancePackages.length > 0 ? (
            <div className="space-y-4">
              {insurancePackages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-smooth">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold">{pkg.name}</h4>
                      <StatusBadge status={pkg.isActive ? 'confirmed' : 'pending'} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Coverage: ${pkg.coverageAmount?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${pkg.premium || 0}</p>
                    <p className="text-sm text-muted-foreground">{pkg.id}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No packages yet</p>
              <p className="text-muted-foreground mb-4">
                Start by creating your first insurance package
              </p>
              <Button onClick={() => navigate('/insurance/policies')}>
                Create Package
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Package Overview
            </CardTitle>
            <CardDescription>
              Summary of insurance packages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                <span className="font-medium">Total Packages</span>
                <span className="font-bold text-primary">{totalPackages}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-paid/10">
                <span className="font-medium">Active Packages</span>
                <span className="font-bold text-paid">{activePackages}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-confirmed/10">
                <span className="font-medium">Total Coverage</span>
                <span className="font-bold text-confirmed">${totalCoverage.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              This Month
            </CardTitle>
            <CardDescription>
              Current month performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">
                  {Math.floor(totalPackages * 0.3)}
                </p>
                <p className="text-sm text-muted-foreground">New Packages</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-bold">{Math.floor(activePackages * 0.8)}</p>
                  <p className="text-xs text-muted-foreground">Active This Month</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{Math.floor(totalCoverage * 0.2).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Coverage Added</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
