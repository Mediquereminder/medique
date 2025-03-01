import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, LogOut, Menu, UserRound, UserCog, CalendarIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, differenceInYears } from "date-fns";
import { cn } from "@/lib/utils";

interface AdminProfile {
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  profilePic: string;
  gender?: string;
  birthDate?: Date;
  height?: number;
  weight?: number;
}

const AdminProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    phone: "",
    department: "",
    role: "admin",
    profilePic: "/placeholder.svg", // Using placeholder avatar as default
    gender: "",
    birthDate: undefined,
    height: undefined,
    weight: undefined,
  });

  const calculateAge = (birthDate?: Date) => {
    if (!birthDate) return undefined;
    return differenceInYears(new Date(), birthDate);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email || user.role !== "admin") {
      navigate("/login");
    }
    
    // Convert stored birthDate string to Date object if it exists
    const birthDate = user.birthDate ? new Date(user.birthDate) : undefined;
    
    setProfile((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      department: user.department || "",
      profilePic: user.profilePic || prev.profilePic,
      gender: user.gender || "",
      birthDate: birthDate,
      height: user.height || undefined,
      weight: user.weight || undefined,
    }));
  }, [navigate]);

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
      const updatedUser = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        gender: profile.gender,
        birthDate: profile.birthDate ? profile.birthDate.toISOString() : undefined,
        height: profile.height,
        weight: profile.weight,
        ...(profile.profilePic !== "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=200&h=200&fit=crop" && {
          profilePic: profile.profilePic,
        }),
      };
      
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
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

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AppSidebar role="admin" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/80">
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
              <Button
                variant="ghost"
                size="icon"
                className="hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SidebarTrigger>
          </nav>

          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-primary">Admin Profile</h2>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <UserCog className="w-4 h-4" />
                    <span>Administrator</span>
                  </div>
                </div>

                <Card className="w-full max-w-2xl border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Profile Information</CardTitle>
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
                      {/* Profile Picture */}
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <img
                            src={profile.profilePic}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
                          />
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

                      {/* Form Fields */}
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
                            <Label htmlFor="birthdate">Birth Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  id="birthdate"
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal bg-white",
                                    !profile.birthDate && "text-muted-foreground"
                                  )}
                                  disabled={!isEditing}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {profile.birthDate ? (
                                    format(profile.birthDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white" align="start">
                                <Calendar
                                  mode="single"
                                  selected={profile.birthDate}
                                  onSelect={(date) =>
                                    setProfile((prev) => ({ ...prev, birthDate: date || undefined }))
                                  }
                                  disabled={!isEditing}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            {profile.birthDate && (
                              <p className="text-sm text-muted-foreground">
                                Age: {calculateAge(profile.birthDate)} years
                              </p>
                            )}
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
                          <Label htmlFor="department">Department</Label>
                          <Input
                            id="department"
                            value={profile.department}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                department: e.target.value,
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

export default AdminProfile;
