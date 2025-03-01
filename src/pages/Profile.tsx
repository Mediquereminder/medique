import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, LogOut, Menu, UserRound, UserCog, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  profilePic: string;
  gender?: string;
  birthDate?: Date;
  height?: number;
  weight?: number;
  age?: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    profilePic: "", // Empty string as default
    gender: "",
    birthDate: undefined,
    height: undefined,
    weight: undefined,
    age: undefined,
  });
  const [userRole, setUserRole] = useState<'patient' | 'admin'>('patient');
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
    setUserRole(user.role || 'patient');
    
    // Convert stored birthDate string to Date object if it exists
    const birthDate = user.birthDate ? new Date(user.birthDate) : undefined;
    
    setProfile((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      emergencyContact: user.emergencyContact || "",
      profilePic: user.profilePic || prev.profilePic,
      gender: user.gender || "",
      birthDate: birthDate,
      height: user.height || undefined,
      weight: user.weight || undefined,
      age: user.age || undefined,
    }));
  }, [navigate]);

  // Generate age options array from 1 to 120
  const ageOptions = Array.from({ length: 120 }, (_, i) => i + 1);

  const handleConnectPatient = () => {
    if (!patientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Patient ID",
        variant: "destructive",
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    
    const patient = users.find((user: any) => user.userId === patientId && user.role === "patient");
    
    if (!patient) {
      toast({
        title: "Error",
        description: "Patient not found. Please check the ID and try again.",
        variant: "destructive",
      });
      return;
    }

    const updatedUsers = users.map((user: any) => {
      if (user.email === currentUser.email) {
        return {
          ...user,
          connectedPatients: [...(user.connectedPatients || []), patientId]
        };
      }
      if (user.userId === patientId) {
        return {
          ...user,
          connectedCaretakers: [...(user.connectedCaretakers || []), currentUser.userId]
        };
      }
      return user;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    const updatedCurrentUser = {
      ...currentUser,
      connectedPatients: [...(currentUser.connectedPatients || []), patientId]
    };
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    toast({
      title: "Success",
      description: "Patient connected successfully!",
    });

    setPatientId("");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({
          ...prev,
          profilePic: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleSave = () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      
      // Create a new Date from the selected age (approximate)
      let birthDateFromAge;
      if (profile.age) {
        const currentDate = new Date();
        birthDateFromAge = new Date();
        birthDateFromAge.setFullYear(currentDate.getFullYear() - profile.age);
      }
      
      const updatedUser = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        emergencyContact: profile.emergencyContact,
        gender: profile.gender,
        birthDate: profile.birthDate ? profile.birthDate.toISOString() : 
                  (birthDateFromAge ? birthDateFromAge.toISOString() : undefined),
        height: profile.height,
        weight: profile.weight,
        age: profile.age,
        ...(profile.profilePic !== "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=200&h=200&fit=crop" && {
          profilePic: profile.profilePic,
        }),
      };
      
      // Update currentUser in localStorage
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      // Also update user in the users array
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((user: any) => {
        if (user.email === updatedUser.email) {
          return updatedUser;
        }
        return user;
      });
      
      // Update users array in localStorage
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyId = () => {
    const userId = JSON.parse(localStorage.getItem("currentUser") || "{}")?.userId;
    if (userId) {
      navigator.clipboard.writeText(userId).then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "ID copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role={userRole} />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img 
                  src="/lovable-uploads/b81c9421-0f7b-46a1-aec0-86a7739c4803.png" 
                  alt="Medique Logo" 
                  className="h-8 w-auto ml-12"
                />
                <div className="text-2xl font-semibold text-primary">Medique</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
            <SidebarTrigger className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-primary">My Profile</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                    {userRole === 'patient' ? (
                      <>
                        <UserRound className="w-4 h-4" />
                        <span>Patient Account</span>
                      </>
                    ) : (
                      <>
                        <UserCog className="w-4 h-4" />
                        <span>Caretaker Account</span>
                      </>
                    )}
                  </div>
                </div>

                <Card className="w-full max-w-2xl mb-6">
                  <CardHeader>
                    <CardTitle>Your ID</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 text-lg font-mono bg-muted p-2 rounded">
                        {JSON.parse(localStorage.getItem("currentUser") || "{}")?.userId || "Not available"}
                      </p>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyId}
                        className="h-10 w-10"
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {userRole === 'patient' 
                        ? "Share this ID with your caretaker to connect with them"
                        : "Use this ID to identify yourself to patients"}
                    </p>
                  </CardContent>
                </Card>

                {userRole === 'admin' && (
                  <Card className="w-full max-w-2xl mb-6">
                    <CardHeader>
                      <CardTitle>Connect with Patient</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4">
                        <Input
                          placeholder="Enter Patient ID"
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                        />
                        <Button onClick={handleConnectPatient}>
                          Connect
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Personal Information</CardTitle>
                      {!isEditing && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          {profile.profilePic ? (
                            <img
                              src={profile.profilePic}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                            />
                          ) : (
                            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary/20">
                              <UserRound className="w-16 h-16 text-muted-foreground" />
                            </div>
                          )}
                          <label
                            htmlFor="profile-pic"
                            className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                          >
                            <Camera className="w-4 h-4" />
                          </label>
                          <input
                            type="file"
                            id="profile-pic"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, name: e.target.value }))
                            }
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                              disabled={!isEditing}
                              value={profile.gender}
                              onValueChange={(value) =>
                                setProfile((prev) => ({ ...prev, gender: value }))
                              }
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="age">Age</Label>
                            <Select
                              disabled={!isEditing}
                              value={profile.age ? profile.age.toString() : ""}
                              onValueChange={(value) =>
                                setProfile((prev) => ({ ...prev, age: parseInt(value, 10) }))
                              }
                            >
                              <SelectTrigger className="w-full bg-white">
                                <SelectValue placeholder="Select age" />
                              </SelectTrigger>
                              <SelectContent className="bg-white max-h-[200px] overflow-y-auto">
                                {ageOptions.map((age) => (
                                  <SelectItem key={age} value={age.toString()}>
                                    {age}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                              id="height"
                              type="number"
                              value={profile.height || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, height: e.target.value ? Number(e.target.value) : undefined }))
                              }
                              disabled={!isEditing}
                              min={0}
                              max={300}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                              id="weight"
                              type="number"
                              value={profile.weight || ""}
                              onChange={(e) =>
                                setProfile((prev) => ({ ...prev, weight: e.target.value ? Number(e.target.value) : undefined }))
                              }
                              disabled={!isEditing}
                              min={0}
                              max={500}
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, phone: e.target.value }))
                            }
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={profile.address}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, address: e.target.value }))
                            }
                            disabled={!isEditing}
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="emergency">Emergency Contact</Label>
                          <Input
                            id="emergency"
                            value={profile.emergencyContact}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                emergencyContact: e.target.value,
                              }))
                            }
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex justify-end gap-4 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Profile;
