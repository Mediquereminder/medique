
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, User, Lock, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import LoadingOverlay from "@/components/LoadingOverlay";

const SignUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [patientCode, setPatientCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showConnectPatient, setShowConnectPatient] = useState(false);

  const generateUniqueCode = () => {
    // Generate a short unique code for patients
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network delay
    setTimeout(() => {
      // Check if email already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const emailExists = users.some((user: any) => user.email === email);
      
      if (emailExists) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "This email is already registered.",
        });
        setIsLoading(false);
        return;
      }
      
      // Generate unique user ID
      const userId = uuidv4();
      
      // Generate unique code for patients to be used by caretakers
      const uniqueCode = role === "patient" ? generateUniqueCode() : "";
      
      // Create new user
      const newUser = {
        userId,
        name,
        email,
        password,
        role,
        uniqueCode,
        notifications: [],
        connectedPatients: [],
        connectedCaretakers: []
      };
      
      // Update users in localStorage
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      
      // Set current user
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
      
      if (role === "patient") {
        // Show generated code to patient
        setGeneratedCode(uniqueCode);
        setTimeout(() => {
          navigate("/dashboard");
        }, 5000);
      } else if (role === "admin") {
        // Show option to connect patient
        setShowConnectPatient(true);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleConnectPatient = () => {
    if (!patientCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a patient code.",
      });
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      // Find patient with the given code
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const patientIndex = users.findIndex((user: any) => 
        user.role === "patient" && user.uniqueCode === patientCode
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
      
      // Get current user
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      // Connect caretaker to patient
      if (!users[patientIndex].connectedCaretakers) {
        users[patientIndex].connectedCaretakers = [];
      }
      users[patientIndex].connectedCaretakers.push(currentUser.userId);
      
      // Connect patient to caretaker
      const caretakerIndex = users.findIndex((user: any) => user.userId === currentUser.userId);
      if (caretakerIndex !== -1) {
        if (!users[caretakerIndex].connectedPatients) {
          users[caretakerIndex].connectedPatients = [];
        }
        users[caretakerIndex].connectedPatients.push(users[patientIndex].userId);
        
        // Update current user
        currentUser.connectedPatients = users[caretakerIndex].connectedPatients;
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
      }
      
      // Update users in localStorage
      localStorage.setItem("users", JSON.stringify(users));
      
      toast({
        title: "Patient connected!",
        description: `You are now connected to ${users[patientIndex].name}.`,
      });
      
      navigate("/admin-dashboard");
    }, 1500);
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-foreground">Account Created!</h2>
          <p className="mt-2 text-muted-foreground">
            Your unique patient code is:
          </p>
          <div className="p-6 bg-primary/10 rounded-md border border-primary/20 my-6">
            <span className="text-3xl font-mono font-bold tracking-widest text-primary">{generatedCode}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this code with your caretaker so they can connect to your account.
            <br />Keep it safe and do not share it with anyone else.
          </p>
          <div className="mt-6">
            <p className="text-sm">You will be redirected to your dashboard in a few seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showConnectPatient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <LoadingOverlay visible={isLoading} message="Connecting to patient..." />
        <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-foreground text-center">Connect to a Patient</h2>
          <p className="mt-2 text-muted-foreground text-center">
            Enter the patient's unique code to connect to their account
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient-code">Patient Code</Label>
              <Input
                id="patient-code"
                placeholder="Enter 6-character code"
                className="uppercase"
                value={patientCode}
                onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                maxLength={6}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleConnectPatient}
              disabled={isLoading}
            >
              Connect to Patient
            </Button>
            
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/admin-dashboard")}
                disabled={isLoading}
              >
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">Create Account</h2>
            <p className="mt-2 text-muted-foreground">
              Sign up to manage your medications
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                    minLength={6}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Account Type</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Select
                    value={role}
                    onValueChange={setRole}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-full pl-10">
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="admin">Caretaker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
