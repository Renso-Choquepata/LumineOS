import { useEffect, useState } from "react";
import { Settings as SettingsIcon, X, Zap, DollarSign, Sliders, Timer, Wallet, RotateCcw } from "lucide-react";
import { Settings } from "@/hooks/useLightController";

interface SettingsPanelProps {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClearHistory?: () => void;
}

export const SettingsPanel = ({ settings, onChange, onClearHistory }: SettingsPanelProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Settings>(settings);

  useEffect(() => {
    if (open) setDraft(settings);
  }, [open, settings]);

  const save = () => {
    onChange(draft);
    setOpen(false);
  };

  const autoOffOptions = [0, 5, 15, 30, 60, 120];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/80 backdrop-blur px-3.5 py-2 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-surface-3 transition-all duration-300"
        aria-label="Abrir configuración"
      >
        <SettingsIcon className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Ajustes</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/70 backdrop-blur-md animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-card relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-6 m-0 sm:m-4 animate-scale-in border-primary/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card/95 backdrop-blur -mx-6 px-6 -mt-6 pt-6 pb-3 z-10 border-b border-border/50">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight text-gradient">
                  Ajustes
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Personaliza tu foco y tarifa
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Wattage */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Zap className="h-4 w-4 text-primary" />
                  Potencia del foco
                  <span className="ml-auto font-mono text-primary">{draft.wattage} W</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={150}
                  step={1}
                  value={draft.wattage}
                  onChange={(e) => setDraft({ ...draft, wattage: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-3 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {[10, 40, 60, 100].map((w) => (
                    <button
                      key={w}
                      onClick={() => setDraft({ ...draft, wattage: w })}
                      className={`rounded-lg px-2 py-1.5 text-xs font-mono border transition-all ${
                        draft.wattage === w
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {w}W
                    </button>
                  ))}
                </div>
              </div>

              {/* Default brightness */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Sliders className="h-4 w-4 text-primary" />
                  Brillo por defecto
                  <span className="ml-auto font-mono text-primary">{draft.brightness}%</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={100}
                  step={5}
                  value={draft.brightness}
                  onChange={(e) => setDraft({ ...draft, brightness: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-3 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Reduce el consumo manteniendo iluminación útil
                </p>
              </div>

              {/* Auto-off */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Timer className="h-4 w-4 text-primary" />
                  Apagado automático
                  <span className="ml-auto font-mono text-primary">
                    {draft.autoOffMinutes === 0 ? "Off" : `${draft.autoOffMinutes} min`}
                  </span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {autoOffOptions.map((m) => (
                    <button
                      key={m}
                      onClick={() => setDraft({ ...draft, autoOffMinutes: m })}
                      className={`rounded-lg px-2 py-1.5 text-xs font-mono border transition-all ${
                        draft.autoOffMinutes === m
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {m === 0 ? "Off" : `${m}m`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  El foco se apagará solo después del tiempo seleccionado
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Precio por kWh
                  <span className="ml-auto font-mono text-primary">${draft.pricePerKwh.toFixed(3)}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  value={draft.pricePerKwh}
                  onChange={(e) => setDraft({ ...draft, pricePerKwh: Number(e.target.value) })}
                  className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                />
              </div>

              {/* Monthly budget */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Wallet className="h-4 w-4 text-primary" />
                  Presupuesto mensual
                  <span className="ml-auto font-mono text-primary">${draft.monthlyBudget.toFixed(2)}</span>
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={draft.monthlyBudget}
                  onChange={(e) => setDraft({ ...draft, monthlyBudget: Number(e.target.value) })}
                  className="w-full rounded-xl bg-surface-2 border border-border px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                />
                <p className="text-[11px] text-muted-foreground mt-1.5">
                  Recibirás una alerta visual al superarlo
                </p>
              </div>

              {/* Danger zone */}
              {onClearHistory && (
                <div className="pt-2 border-t border-border/60">
                  <button
                    onClick={() => {
                      if (confirm("¿Borrar todo el historial? Esta acción no se puede deshacer.")) {
                        onClearHistory();
                        setOpen(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 text-xs text-destructive hover:underline"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Borrar historial
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-card/95 backdrop-blur -mx-6 px-6 pb-2 pt-3 border-t border-border/50">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface-2 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  className="flex-1 rounded-xl bg-gradient-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-soft hover:shadow-glow transition-all duration-300"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
