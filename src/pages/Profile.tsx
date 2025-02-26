
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Pencil, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  profilePic: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    profilePic: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=200&h=200&fit=crop",
  });

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

  const handleSave = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const updatedUser = { ...currentUser, ...profile };
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    
    setIsEditing(false);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar role="patient" />
        <div className="flex-1">
          <div className="pt-[73px]">
            <main className="container mx-auto px-4 py-8">
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-primary mb-8">My Profile</h2>

                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Personal Information</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        ) : (
                          <>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                          </>
                        )}
                      </Button>
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
