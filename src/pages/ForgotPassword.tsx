import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Home, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: "Email required",
                description: "Please enter your email address.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Mock password reset request - in real app, this would call an API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            setEmailSent(true);
            toast({
                title: "Reset email sent!",
                description: "Check your email for password reset instructions.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold">Check Your Email</h1>
                        <p className="text-muted-foreground mt-2">
                            We've sent password reset instructions to {email}
                        </p>
                    </div>

                    <Card className="medical-card">
                        <CardContent className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-6">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => setEmailSent(false)}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Try Different Email
                                </Button>

                                <Link
                                    to="/login"
                                    className="block w-full"
                                >
                                    <Button className="w-full hero-gradient text-white font-semibold">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

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
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Reset Password</h1>
                    <p className="text-muted-foreground mt-2">
                        Enter your email address and we'll send you a link to reset your password
                    </p>
                </div>

                <Card className="medical-card">
                    <CardHeader className="text-center">
                        <CardTitle>Forgot Password</CardTitle>
                        <CardDescription>
                            No worries, we'll help you get back into your account
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full hero-gradient text-white font-semibold transition-smooth hover:scale-105"
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <div className="text-sm text-muted-foreground">
                                Remember your password?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary hover:text-primary-hover font-medium transition-smooth"
                                >
                                    Sign in
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
