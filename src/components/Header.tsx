import { Button } from "@/components/ui/button";
import { Heart, Menu, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TherapyConnect</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              חיפוש מטפלים
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              למטפלים
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              אודות
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm">
              התחברות
            </Button>
            <Button variant="default" size="sm">
              <User className="w-4 h-4 ml-1" />
              הרשמה
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                חיפוש מטפלים
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                למטפלים
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                אודות
              </a>
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1">
                  התחברות
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  הרשמה
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
