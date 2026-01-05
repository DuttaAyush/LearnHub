import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: "blue" | "teal" | "green";
  icon?: ReactNode;
}

export function StatCard({ title, value, subtitle, variant = "blue", icon }: StatCardProps) {
  const variantClasses = {
    blue: "stat-card-blue",
    teal: "stat-card-teal",
    green: "stat-card-green",
  };

  return (
    <div className={`stat-card ${variantClasses[variant]} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-accent font-medium">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-background/50">{icon}</div>
        )}
      </div>
    </div>
  );
}
