import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ConvoRetail
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#languages" className="text-foreground/80 hover:text-foreground transition-colors">
              Languages
            </a>
            <a href="#integrations" className="text-foreground/80 hover:text-foreground transition-colors">
              Integrations
            </a>
            <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="ghost">Sign In</Button>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                Features
              </a>
              <a href="#languages" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                Languages
              </a>
              <a href="#integrations" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                Integrations
              </a>
              <a href="#pricing" className="text-foreground/80 hover:text-foreground transition-colors py-2">
                Pricing
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <div className="flex justify-center mb-2">
                  <ThemeToggle />
                </div>
                <Button variant="ghost" className="w-full">Sign In</Button>
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
