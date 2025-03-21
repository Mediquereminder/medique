
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LoadingOverlay from "@/components/LoadingOverlay";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      
      toast({
        title: "Reset link sent",
        description: "Please check your email for password reset instructions.",
      });
      
      // In a real app, here you would send a password reset email
      // For this demo, we'll just redirect to reset password
      localStorage.setItem("resetEmail", email);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <LoadingOverlay visible={isLoading} message="Sending reset instructions..." />
      
      {/* Back Button */}
      <Link
        to="/login"
        className="fixed top-4 left-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Login
      </Link>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-lg">
          {!submitted ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground">Forgot Password</h2>
                <p className="mt-2 text-muted-foreground">
                  Enter your email to receive password reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Instructions"}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div>
                <div className="bg-primary/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>
                <p className="mt-2 text-muted-foreground">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>
              
              <Link to="/reset-password" className="inline-block">
                <Button className="w-full">
                  Continue to Reset Password
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
