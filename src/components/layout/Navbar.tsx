import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, BookOpen, BarChart3, LogOut, User, Bot, GraduationCap, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/subjects", label: "Subjects", icon: GraduationCap },
  { path: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary backdrop-blur supports-[backdrop-filter]:bg-primary/95">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <GraduationCap className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary-foreground">LearnHub</span>
            <span className="text-xs text-primary-foreground/70">Adaptive Learning</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center gap-2 ${
                  isActive ? "active" : "text-primary-foreground/80 hover:text-primary-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-accent">
                    <AvatarFallback className="bg-accent text-accent-foreground font-semibold">
                      {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{profile?.username || "User"}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="btn-primary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
