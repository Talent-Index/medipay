import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Users, Activity, Wallet, Home } from "lucide-react";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, loginWithEmail } = useAuthStore();
  const { toast } = useToast();
  const account = useCurrentAccount();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);

  const handleWalletLogin = async () => {
    if (!account?.address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet before logging in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(account.address);

      if (success) {
        // Get the user from the auth store to determine their role
        const { user } = useAuthStore.getState();
        const redirectPath = user?.role === 'doctor' ? '/doctor' :
          user?.role === 'institution' ? '/institution' :
            user?.role === 'insurance' ? '/insurance' : '/patient';

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        navigate(redirectPath);
      } else {
        toast({
          title: "Login failed",
          description: "User not found. Please register first.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast({ title: "Missing credentials", description: "Enter email and password.", variant: "destructive" });
      return;
    }
    setIsEmailLoading(true);
    try {
      const success = await loginWithEmail(email, password);
      if (success) {
        const { user } = useAuthStore.getState();
        const redirectPath = user?.role === 'doctor' ? '/doctor' : user?.role === 'institution' ? '/institution' : user?.role === 'insurance' ? '/insurance' : '/patient';
        toast({ title: "Welcome back!", description: "You have successfully logged in." });
        navigate(redirectPath);
      } else {
        toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/30 to-primary/5 flex items-center justify-center p-4">
      {/* Home Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 left-4 gap-2"
        onClick={() => navigate('/')}
      >
        <Home className="w-4 h-4" />
        Home
      </Button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-medical mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to MediPay</h1>
          <p className="text-muted-foreground mt-2">
            Secure login to your healthcare payment dashboard
          </p>
        </div>

        <Card className="medical-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Wallet className="w-5 h-5" />
              Sign In
            </CardTitle>
            <CardDescription>
              Sign in using your wallet or email and password
            </CardDescription>
          </CardHeader>

          <CardContent>

            <div className="mt-6 space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              </div>
              <Button onClick={handleEmailLogin} className="w-full hero-gradient text-white font-semibold transition-smooth hover:scale-105" disabled={isEmailLoading}>
                {isEmailLoading ? "Signing in..." : "Sign In with Email"}
              </Button>
            </div>

            <div className="mt-6 flex flex-col items-center">
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-gradient-to-br from-background via-accent/30 to-primary/5 text-muted-foreground">Or continue with</span>
                </div>
              </div>


              <div className="space-y-6">
                {!account?.address ? (
                  <div className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Connect your wallet to sign in to your account
                    </p>
                    <ConnectWalletButton />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Connected Wallet:</p>
                      <p className="font-mono text-sm break-all">{account.address}</p>
                    </div>

                    <Button
                      onClick={handleWalletLogin}
                      className="w-full hero-gradient text-white font-semibold transition-smooth hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In with Wallet"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:text-primary-hover font-medium transition-smooth">Sign up</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}