
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Medal, Shield, Bell, Heart } from "lucide-react";

const features = [
  {
    icon: Medal,
    title: "Smart Reminders",
    description: "Never miss a dose with our intelligent reminder system",
  },
  {
    icon: Shield,
    title: "Secure Tracking",
    description: "Keep your medical information safe and private",
  },
  {
    icon: Bell,
    title: "Real-time Alerts",
    description: "Get notified when medication stock is running low",
  },
  {
    icon: Heart,
    title: "Care Connection",
    description: "Stay connected with your healthcare providers",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass-panel">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-semibold text-primary">Medique</div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login" className="button-transition">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup" className="button-transition">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 md:pt-32 page-fade-in">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Your Personal Medication Assistant
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Stay on track with your medications and never miss a dose. The smart way to manage your health journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="hover-lift">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="hover-lift">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-accent/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Medique?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-lg glass-panel hover-lift"
              >
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Medique. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
