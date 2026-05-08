import { useEffect, useMemo, useState } from "react";
import {
  useLightController,
  totalActiveMs,
  totalKwh,
  formatDuration,
  exportToCsv,
} from "@/hooks/useLightController";
import { LightBulb } from "@/components/LightBulb";
import { StatCard } from "@/components/StatCard";
import { UsageChart } from "@/components/UsageChart";
import { HistoryTimeline } from "@/components/HistoryTimeline";
import { SettingsPanel } from "@/components/SettingsPanel";
import {
  Activity,
  Clock,
  DollarSign,
  Zap,
  Lightbulb,
  Wifi,
  Download,
  Timer,
  Leaf,
} from "lucide-react";

const Index = () => {
  const {
    isOn,
    toggle,
    turnOn,
    events,
    settings,
    setSettings,
    currentSessionStart,
    clearHistory,
    isConnected,
  } = useLightController();
  const [, setTick] = useState(0);

  // Live timer when light is on
  useEffect(() => {
    if (!isOn) return;
    const t = setInterval(() => setTick((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, [isOn]);

  const stats = useMemo(() => {
    const now = Date.now();
    
    // Semanal (Inicia lunes)
    const weekStart = new Date();
    const dayOfWeek = weekStart.getDay() || 7;
    weekStart.setDate(weekStart.getDate() - dayOfWeek + 1);
    weekStart.setHours(0, 0, 0, 0);

    // Mensual
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    // Anual
    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);

    const weekMs = totalActiveMs(events, weekStart.getTime(), now);
    const monthMs = totalActiveMs(events, monthStart.getTime(), now);
    const yearMs = totalActiveMs(events, yearStart.getTime(), now);

    return {
      weekMs,
      monthMs,
      yearMs,
    };
  }, [events]);

  const liveSession = currentSessionStart ? Date.now() - currentSessionStart : 0;

  // Auto-off countdown
  const autoOffRemaining = useMemo(() => {
    if (!isOn || settings.autoOffMinutes === 0 || !currentSessionStart) return null;
    const remaining = settings.autoOffMinutes * 60000 - (Date.now() - currentSessionStart);
    return remaining > 0 ? remaining : 0;
  }, [isOn, settings.autoOffMinutes, currentSessionStart]);

  const handleQuickAction = (brightness: number) => {
    setSettings({ ...settings, brightness });
    if (!isOn) turnOn();
  };

  const handleBrightnessChange = (brightness: number) => {
    setSettings({ ...settings, brightness });
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Decorative top glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] bg-primary/15 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute top-40 right-0 h-[300px] w-[400px] bg-accent/10 blur-[120px] rounded-full" />

      <div className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 sm:mb-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow-soft">
                <Lightbulb className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background animate-pulse" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                Lumen<span className="text-gradient">OS</span>
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Smart Light Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-surface-2/80 backdrop-blur border border-border px-3 py-2">
              <Wifi className={`h-3.5 w-3.5 ${isConnected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-mono text-xs text-muted-foreground">
                Arduino · <span className={isConnected ? "text-primary" : "text-muted-foreground"}>{isConnected ? "Conectado" : "Desconectado"}</span>
              </span>
            </div>
            <button
              onClick={() => exportToCsv(events, settings.wattage)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/80 backdrop-blur px-3.5 py-2 text-sm font-medium text-foreground hover:border-primary/40 transition-all"
              aria-label="Exportar datos"
            >
              <Download className="h-4 w-4 text-primary" />
              <span className="hidden md:inline">Exportar</span>
            </button>
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              onClearHistory={clearHistory}
            />
          </div>
        </header>

        {/* Hero control + key metrics */}
        <section className="grid lg:grid-cols-5 gap-5 sm:gap-6 mb-6 sm:mb-8">
          {/* Bulb control */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden animate-scale-in">
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                isOn ? "opacity-100" : "opacity-0"
              }`}
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, hsl(var(--primary) / 0.18), transparent 60%)",
              }}
            />

            <div className="relative font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              Foco principal · Salón
            </div>

            <div className="relative my-6">
              <LightBulb isOn={isOn} brightness={settings.brightness} onToggle={toggle} />
            </div>

            {/* Live session info */}
            <div className="relative w-full grid grid-cols-3 gap-2 mt-4">
              <div className="rounded-xl bg-surface-1/60 border border-border/60 p-2.5 text-center">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Sesión
                </div>
                <div
                  className={`font-mono text-xs mt-1 font-semibold ${
                    isOn ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isOn ? formatDuration(liveSession) : "—"}
                </div>
              </div>
              <div className="rounded-xl bg-surface-1/60 border border-border/60 p-2.5 text-center">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Potencia
                </div>
                <div className="font-mono text-xs mt-1 font-semibold text-primary">
                  {Math.round((settings.wattage * settings.brightness) / 100)}W
                </div>
              </div>
              <div className="rounded-xl bg-surface-1/60 border border-border/60 p-2.5 text-center">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  Auto-off
                </div>
                <div className="font-mono text-xs mt-1 font-semibold text-primary inline-flex items-center justify-center gap-1">
                  {autoOffRemaining !== null ? (
                    <>
                      <Timer className="h-3 w-3" />
                      {formatDuration(autoOffRemaining)}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={toggle}
              disabled={!isConnected}
              className={`relative mt-5 w-full rounded-2xl py-3.5 font-semibold text-sm tracking-wide transition-all duration-500 ${
                !isConnected
                  ? "bg-surface-3 text-muted-foreground cursor-not-allowed opacity-50"
                  : isOn
                  ? "bg-surface-2 border border-border text-foreground hover:bg-surface-3"
                  : "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-elevated"
              }`}
            >
              {!isConnected ? "Desconectado" : isOn ? "Apagar foco" : "Encender foco"}
            </button>
          </div>

          {/* Right column: brightness + quick actions + stats */}
          <div className="lg:col-span-3 space-y-5 sm:space-y-6">
            <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
              <StatCard
                label="Esta Semana"
                value={formatDuration(stats.weekMs).split(" ")[0]}
                unit={formatDuration(stats.weekMs).split(" ")[1] || ""}
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                label="Este Mes"
                value={formatDuration(stats.monthMs).split(" ")[0]}
                unit={formatDuration(stats.monthMs).split(" ")[1] || ""}
                icon={<Clock className="h-5 w-5" />}
              />
              <StatCard
                label="Este Año"
                value={formatDuration(stats.yearMs).split(" ")[0]}
                unit={formatDuration(stats.yearMs).split(" ")[1] || ""}
                icon={<Clock className="h-5 w-5" />}
              />
            </div>
          </div>
        </section>

        {/* Charts + Timeline */}
        <section className="grid lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 animate-fade-in">
            <UsageChart
              events={events}
              wattage={settings.wattage}
              pricePerKwh={settings.pricePerKwh}
            />
          </div>
          <div className="animate-fade-in">
            <HistoryTimeline events={events} />
          </div>
        </section>

        <footer className="mt-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            LumenOS · v1.1 · Simulación de control Arduino
          </p>
        </footer>
      </div>
    </main>
  );
};

export default Index;
