import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LightEvent, totalActiveMs, kwhFromMs } from "@/hooks/useLightController";

type Range = "day" | "week" | "month" | "year";

interface UsageChartProps {
  events: LightEvent[];
  wattage: number;
  pricePerKwh: number;
}

export const UsageChart = ({ events, wattage, pricePerKwh }: UsageChartProps) => {
  const [range, setRange] = useState<Range>("week");

  const data = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; start: number; end: number }[] = [];

    if (range === "day") {
      // 24 hours
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      for (let h = 0; h < 24; h++) {
        const start = dayStart.getTime() + h * 3600000;
        buckets.push({
          label: `${h.toString().padStart(2, "0")}h`,
          start,
          end: start + 3600000,
        });
      }
    } else if (range === "week") {
      // last 7 days
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const start = d.getTime();
        buckets.push({ label: days[d.getDay()], start, end: start + 86400000 });
      }
    } else if (range === "month") {
      // last 30 days, every 3 days bucket -> 10 bars
      for (let i = 9; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 3);
        d.setHours(0, 0, 0, 0);
        const start = d.getTime() - 2 * 86400000;
        const end = d.getTime() + 86400000;
        buckets.push({ label: `${d.getDate()}`, start, end });
      }
    } else {
      // year - last 12 months
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        buckets.push({ label: months[d.getMonth()], start: d.getTime(), end: end.getTime() });
      }
    }

    return buckets.map((b) => {
      const ms = totalActiveMs(events, b.start, b.end);
      const hours = ms / 3600000;
      const kwh = kwhFromMs(ms, wattage);
      return {
        label: b.label,
        hours: Number(hours.toFixed(2)),
        kwh: Number(kwh.toFixed(3)),
        cost: Number((kwh * pricePerKwh).toFixed(2)),
      };
    });
  }, [events, range, wattage, pricePerKwh]);

  const ranges: { id: Range; label: string }[] = [
    { id: "day", label: "Día" },
    { id: "week", label: "Semana" },
    { id: "month", label: "Mes" },
    { id: "year", label: "Año" },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Análisis de uso
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
            Horas activas por período
          </p>
        </div>
        <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-border">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 ${
                range === r.id
                  ? "bg-primary text-primary-foreground shadow-glow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {range === "day" ? (
            <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} interval={2} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(v: number) => [`${v} h`, "Activo"]}
              />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#hoursGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
                formatter={(v: number, name: string) => {
                  if (name === "hours") return [`${v} h`, "Activo"];
                  return [v, name];
                }}
              />
              <Bar dataKey="hours" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
