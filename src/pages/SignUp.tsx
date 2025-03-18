
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, User, Mail, Lock, UserPlus, UserCog, Shield, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";
import LoadingOverlay from "@/components/LoadingOverlay";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [patientCode, setPatientCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateUniqueCode = () => {
    // Generate a short unique code (first 8 characters of UUID)
    return uuidv4().substring(0, 8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name || !email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsLoading(true);

    // Simulate network delay
    setTimeout(() => {
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u: any) => u.email === email);

      if (existingUser) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email already registered.",
        });
        setIsLoading(false);
        return;
      }

      // Create new user based on role
      const userId = uuidv4();
      let newUser: any = {
        userId,
        name,
        email,
        password,
        role: role === "admin" ? "admin" : "patient",
        notifications: [],
      };

      // If it's a patient, generate a unique code
      if (role === "patient") {
        newUser.uniqueCode = generateUniqueCode();
        newUser.connectedCaretakers = [];
      } else {
        // It's a caretaker (admin)
        newUser.connectedPatients = [];
      }

      // Connect patient to caretaker if a code was provided
      if (role === "admin" && patientCode) {
        const patientIndex = users.findIndex((u: any) => 
          u.role === "patient" && u.uniqueCode === patientCode
        );

        if (patientIndex === -1) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Invalid patient code.",
          });
          setIsLoading(false);
          return;
        }

        // Add caretaker to patient's connected caretakers
        users[patientIndex].connectedCaretakers = [
          ...(users[patientIndex].connectedCaretakers || []),
          userId
        ];
        
        // Add patient to caretaker's connected patients
        newUser.connectedPatients = [users[patientIndex].userId];
        
        // Add notification for the patient
        users[patientIndex].notifications = [
          {
            title: "New Caretaker Connected",
            message: `${name} is now your caretaker and can manage your medications.`,
            timestamp: new Date().toISOString(),
            type: "connection",
            read: false
          },
          ...(users[patientIndex].notifications || [])
        ];
        
        // Add notification for the caretaker
        newUser.notifications = [
          {
            title: "Patient Connected",
            message: `You are now connected to ${users[patientIndex].name} as their caretaker.`,
            timestamp: new Date().toISOString(),
            type: "connection",
            read: false
          }
        ];
      }

      // Save updated users
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));

      // Show success toast
      toast({
        title: "Account created",
        description: "Your account has been successfully created.",
      });

      // Redirect to dashboard
      navigate(role === "admin" ? "/admin-dashboard" : "/dashboard");
    }, 1500); // Show loading for 1.5 seconds
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <LoadingOverlay visible={isLoading} message="Creating your account..." />
      
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-4 left-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      {/* Signup Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
            <p className="mt-2 text-muted-foreground">
              Join Medique to manage medications effectively
            </p>
          </div>

          <Tabs defaultValue="patient" value={role} onValueChange={setRole} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Patient
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Caretaker
              </TabsTrigger>
            </TabsList>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {role === "patient" ? (
                    <>
                      <UserPlus className="h-5 w-5 text-primary" />
                      Register as Patient
                    </>
                  ) : (
                    <>
                      <UserCog className="h-5 w-5 text-primary" />
                      Register as Caretaker
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {role === "patient" 
                    ? "Create an account to track your medications and connect with caretakers." 
                    : "Sign up to help manage medications for your patients."}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="Your name"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
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

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {role === "admin" && (
                    <div className="space-y-2">
                      <Label htmlFor="patient-code">
                        Patient Code (Optional)
                      </Label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="patient-code"
                          placeholder="Enter patient code to connect"
                          className="pl-10"
                          value={patientCode}
                          onChange={(e) => setPatientCode(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Connect to an existing patient by entering their unique code.
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
