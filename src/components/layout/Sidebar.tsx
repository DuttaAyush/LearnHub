import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, BarChart3, Settings, HelpCircle, Bot, GraduationCap } from "lucide-react";

const sidebarItems = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/subjects", label: "Subjects", icon: GraduationCap },
  { path: "/lessons", label: "Lessons", icon: BookOpen },
  { path: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-sidebar-foreground">LearnHub</span>
            <span className="text-xs text-sidebar-foreground/70">Adaptive Learning</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path === "/lessons" && location.pathname.startsWith("/lesson")) ||
            (item.path === "/subjects" && location.pathname === "/subjects");
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/help"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
        >
          <HelpCircle className="h-5 w-5" />
          Help
        </Link>
      </div>
    </aside>
  );
}
