import { Button } from "@/components/ui/button";
import { Heart, Menu, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">TherapyConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              חיפוש מטפלים
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              למטפלים
            </Link>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              אודות
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 rounded-full px-4 border-primary/20 hover:border-primary/50 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate font-medium">
                      {user.user_metadata?.full_name || user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-2 py-1.5 mb-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">החשבון שלי</p>
                  </div>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-primary/5 focus:text-primary mb-1">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>לוח בקרה</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer rounded-md focus:bg-primary/5 focus:text-primary">
                    <Link to={`/therapist/${user.id}`} className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>פרופיל אישי</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer rounded-md text-destructive focus:bg-destructive/5 focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span className="mr-auto">התנתק</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" className="rounded-full px-6" asChild>
                <Link to="/auth">כניסת מטפלים</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full h-10 w-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-4 duration-200" dir="rtl">
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 font-medium">
                חיפוש מטפלים
              </Link>
              <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 font-medium">
                למטפלים
              </Link>
              <a href="#" className="text-foreground hover:text-primary transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 font-medium">
                אודות
              </a>
              <div className="pt-4 border-t mt-2">
                {user ? (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" className="justify-start gap-2" asChild>
                      <Link to="/dashboard">
                        <LayoutDashboard className="w-4 h-4" />
                        לוח בקרה
                      </Link>
                    </Button>
                    <Button variant="ghost" className="justify-start gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 text-destructive" />
                      התנתק
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" asChild>
                    <Link to="/auth">כניסת מטפלים</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
