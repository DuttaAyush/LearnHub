import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function Layout({ children, showSidebar = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!showSidebar && <Navbar />}
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? "min-h-screen" : ""}`}>
          {showSidebar && (
            <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-6">
              <div className="flex-1" />
            </header>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
