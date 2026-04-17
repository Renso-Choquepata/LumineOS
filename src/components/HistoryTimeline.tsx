import { LightEvent, formatDuration } from "@/hooks/useLightController";
import { Lightbulb, Power } from "lucide-react";

interface HistoryTimelineProps {
  events: LightEvent[];
}

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (ts: number) => {
  const d = new Date(ts);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const eventDay = new Date(d);
  eventDay.setHours(0, 0, 0, 0);

  if (eventDay.getTime() === today.getTime()) return "Hoy";
  if (eventDay.getTime() === yesterday.getTime()) return "Ayer";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
};

export const HistoryTimeline = ({ events }: HistoryTimelineProps) => {
  const recent = [...events].reverse().slice(0, 12);
  const now = Date.now();

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Historial reciente
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Últimos {recent.length} eventos
          </p>
        </div>
        <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Lightbulb className="h-8 w-8 mb-2 opacity-50" />
          <p className="text-sm">Aún no hay eventos</p>
        </div>
      ) : (
        <div className="relative max-h-[420px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

          <ul className="space-y-3">
            {recent.map((e, idx) => {
              const isActive = e.offAt === null;
              const duration = (e.offAt ?? now) - e.onAt;
              return (
                <li
                  key={e.id}
                  className="relative pl-10 animate-fade-in"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-2 top-3 h-3 w-3 rounded-full border-2 ${
                      isActive
                        ? "bg-accent border-accent shadow-[0_0_12px_hsl(var(--accent))]"
                        : "bg-surface-1 border-primary/60"
                    }`}
                  />

                  <div className="rounded-xl bg-surface-1/60 border border-border/60 p-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Power
                          className={`h-3.5 w-3.5 shrink-0 ${
                            isActive ? "text-accent" : "text-primary"
                          }`}
                        />
                        <span className="font-mono text-xs text-foreground truncate">
                          {formatTime(e.onAt)}
                          {!isActive && ` → ${formatTime(e.offAt!)}`}
                          {isActive && " → ahora"}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground shrink-0">
                        {formatDate(e.onAt)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Duración
                      </span>
                      <span
                        className={`font-mono text-xs font-medium ${
                          isActive ? "text-accent" : "text-foreground"
                        }`}
                      >
                        {formatDuration(duration)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary) / 0.5); }
      `}</style>
    </div>
  );
};
