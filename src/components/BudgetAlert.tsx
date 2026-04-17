import { AlertTriangle, CheckCircle2, Wallet } from "lucide-react";

interface BudgetAlertProps {
  monthCost: number;
  budget: number;
  projectedCost: number;
}

export const BudgetAlert = ({ monthCost, budget, projectedCost }: BudgetAlertProps) => {
  if (budget <= 0) return null;

  const pct = Math.min(100, (monthCost / budget) * 100);
  const projectedPct = Math.min(150, (projectedCost / budget) * 100);
  const isOver = monthCost > budget;
  const isWarning = projectedCost > budget && !isOver;
  const isOk = !isOver && !isWarning;

  const stateColor = isOver
    ? "destructive"
    : isWarning
    ? "warning"
    : "primary";

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          <h4 className="font-display text-sm font-semibold">Presupuesto del mes</h4>
        </div>
        {isOver && (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 border border-destructive/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-destructive">
            <AlertTriangle className="h-3 w-3" />
            Excedido
          </span>
        )}
        {isWarning && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--warning))]/15 border border-[hsl(var(--warning))]/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[hsl(var(--warning))]">
            <AlertTriangle className="h-3 w-3" />
            Cuidado
          </span>
        )}
        {isOk && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-primary">
            <CheckCircle2 className="h-3 w-3" />
            En camino
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="font-display text-2xl font-bold">${monthCost.toFixed(2)}</span>
        <span className="font-mono text-xs text-muted-foreground">/ ${budget.toFixed(2)}</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 w-full rounded-full bg-surface-3 overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full transition-all duration-700 ${
            stateColor === "destructive"
              ? "bg-destructive"
              : stateColor === "warning"
              ? "bg-[hsl(var(--warning))]"
              : "bg-gradient-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
        {/* Projected marker */}
        {!isOver && (
          <div
            className="absolute top-0 h-full w-0.5 bg-foreground/40"
            style={{ left: `${Math.min(100, projectedPct)}%` }}
            title="Proyección a fin de mes"
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        <span>{pct.toFixed(0)}% usado</span>
        <span>Proyección: ${projectedCost.toFixed(2)}</span>
      </div>
    </div>
  );
};
