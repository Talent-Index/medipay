import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Home, CheckCircle } from "lucide-react";

export default function CreatePassword() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordSet, setPasswordSet] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Passwords don't match",
                description: "Please make sure both passwords are the same.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Password too short",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Connect password creation to backend API with token
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

            setPasswordSet(true);
            toast({
                title: "Password created!",
                description: "Your password has been set successfully.",
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

    if (passwordSet) {
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
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold">Password Set!</h1>
                        <p className="text-muted-foreground mt-2">
                            Your password has been created successfully
                        </p>
                    </div>

                    <Card className="medical-card">
                        <CardContent className="text-center py-8">
                            <p className="text-sm text-muted-foreground mb-6">
                                You can now sign in to your account with your new password.
                            </p>

                            <Link to="/login" className="block w-full">
                                <Button className="w-full hero-gradient text-white font-semibold">
                                    Sign In Now
                                </Button>
                            </Link>
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
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">Create Password</h1>
                    <p className="text-muted-foreground mt-2">
                        Set a strong password for your account
                    </p>
                </div>

                <Card className="medical-card">
                    <CardHeader className="text-center">
                        <CardTitle>New Password</CardTitle>
                        <CardDescription>
                            Choose a secure password that you'll remember
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 8 characters long
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full hero-gradient text-white font-semibold transition-smooth hover:scale-105"
                                disabled={isLoading}
                            >
                                {isLoading ? "Setting Password..." : "Set Password"}
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
