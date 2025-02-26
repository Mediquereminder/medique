import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  profilePic: string;
  role: "patient" | "caretaker";  // Added role to interface
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return localStorage.getItem("sidebarState") === "true";
  });
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    profilePic: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=200&h=200&fit=crop",
    role: "patient",  // Default role
  });

  useEffect(() => {
    localStorage.setItem("sidebarState", String(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (!user.email) {
      navigate("/login");
    }
    if (user.role === "admin") {
      navigate("/admin-dashboard");
    }
    // Load existing profile data
    setProfile((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      emergencyContact: user.emergencyContact || "",
      profilePic: user.profilePic || prev.profilePic,
      role: user.role || "patient",
    }));
  }, [navigate]);

  const handleImageUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile((prev) => ({ ...prev, profilePic: reader.result as string }));
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
        address: profile.address,
        emergencyContact: profile.emergencyContact,
        role: profile.role,
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
    <SidebarProvider 
      defaultOpen={sidebarOpen} 
      onOpenChange={(open) => setSidebarOpen(open)}
    >
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <nav className="glass-panel fixed top-0 left-0 right-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-semibold text-primary ml-12">Medique</div>
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
                  <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {profile.role === "patient" ? "Patient Account" : "Caretaker Account"}
                  </div>
                </div>

                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      View and manage your profile information here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profilePic} alt="Profile Picture" />
                        <AvatarFallback>
                          {profile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Label htmlFor="picture">Profile Picture</Label>
                        <Input
                          id="picture"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            document.getElementById("picture")?.click()
                          }
                        >
                          Change
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          type="text"
                          id="name"
                          value={profile.name}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          type="email"
                          id="email"
                          value={profile.email}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, email: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          type="tel"
                          id="phone"
                          value={profile.phone}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile((prev) => ({ ...prev, phone: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="emergencyContact">Emergency Contact</Label>
                        <Input
                          type="tel"
                          id="emergencyContact"
                          value={profile.emergencyContact}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              emergencyContact: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={profile.address}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, address: e.target.value }))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button variant="ghost" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave}>Save</Button>
                        </div>
                      ) : (
                        <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
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
