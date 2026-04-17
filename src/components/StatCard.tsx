import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  icon?: ReactNode;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "secondary" | "accent";
}

export const StatCard = ({
  label,
  value,
  unit,
  icon,
  trend,
  accent = "primary",
}: StatCardProps) => {
  const accentMap = {
    primary: "text-primary shadow-glow-soft",
    secondary: "text-secondary",
    accent: "text-accent",
  };

  return (
    <div className="glass-card group relative overflow-hidden rounded-2xl p-5 transition-all duration-500 hover:border-primary/40 hover:-translate-y-0.5">
      {/* Animated corner accent */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-50" />

      <div className="relative flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        </div>
        {icon && (
          <div className={`${accentMap[accent]} transition-transform duration-500 group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>

      <div className="relative mt-4 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-semibold text-foreground tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs text-muted-foreground">{unit}</span>
        )}
      </div>

      {trend && (
        <div className="relative mt-3 flex items-center gap-2">
          <span
            className={`font-mono text-xs ${
              trend.positive ? "text-accent" : "text-destructive"
            }`}
          >
            {trend.positive ? "↑" : "↓"} {trend.value}
          </span>
          <span className="text-[10px] text-muted-foreground">vs ayer</span>
        </div>
      )}
    </div>
  );
};
