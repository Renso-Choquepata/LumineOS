import { Moon, Sun, Sunrise, Coffee } from "lucide-react";

interface QuickActionsProps {
  isOn: boolean;
  onAction: (brightness: number) => void;
  currentBrightness: number;
}

const presets = [
  { id: "reading", label: "Lectura", icon: Coffee, brightness: 100, hint: "Brillo máximo" },
  { id: "day", label: "Día", icon: Sun, brightness: 80, hint: "Luz natural" },
  { id: "evening", label: "Tarde", icon: Sunrise, brightness: 50, hint: "Ambiente cálido" },
  { id: "night", label: "Noche", icon: Moon, brightness: 20, hint: "Luz tenue" },
];

export const QuickActions = ({ isOn, onAction, currentBrightness }: QuickActionsProps) => {
  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display text-sm font-semibold">Escenas rápidas</h4>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
            Toca para activar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const Icon = p.icon;
          const active = isOn && currentBrightness === p.brightness;
          return (
            <button
              key={p.id}
              onClick={() => onAction(p.brightness)}
              className={`group flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all duration-300 ${
                active
                  ? "border-primary/60 bg-primary/10 shadow-glow-soft"
                  : "border-border bg-surface-1/40 hover:border-primary/40 hover:bg-surface-2"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                  active ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground group-hover:text-primary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground">{p.label}</div>
                <div className="font-mono text-[10px] text-muted-foreground truncate">
                  {p.brightness}% · {p.hint}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
