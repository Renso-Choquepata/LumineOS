import { Power } from "lucide-react";

interface LightBulbProps {
  isOn: boolean;
  brightness: number; // 0-100
  onToggle: () => void;
}

export const LightBulb = ({ isOn, brightness, onToggle }: LightBulbProps) => {
  // brightness affects opacity of glow when ON
  const glowOpacity = Math.max(0.3, brightness / 100);

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Ambient glow ring */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${
          isOn ? "bg-primary/40 scale-150" : "bg-primary/5 scale-100 opacity-0"
        }`}
        style={{ opacity: isOn ? glowOpacity * 0.6 : 0 }}
      />

      {/* Outer rotating ring */}
      <div
        className={`absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full border transition-all duration-700 ${
          isOn ? "border-primary/30" : "border-border"
        }`}
        style={{
          background: isOn
            ? "conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.18), transparent)"
            : "none",
          animation: isOn ? "spin 8s linear infinite" : "none",
        }}
      />

      {/* Inner static ring */}
      <div
        className={`absolute w-[230px] h-[230px] sm:w-[280px] sm:h-[280px] rounded-full border transition-colors duration-700 ${
          isOn ? "border-primary/20" : "border-border/60"
        }`}
      />

      {/* Bulb */}
      <button
        onClick={onToggle}
        aria-label={isOn ? "Apagar foco" : "Encender foco"}
        aria-pressed={isOn}
        className="group relative outline-none focus-visible:ring-4 focus-visible:ring-primary/50 rounded-full transition-transform duration-500 active:scale-95 hover:scale-105"
      >
        <div
          className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full flex items-center justify-center transition-all duration-700 ${
            isOn ? "bulb-glow-on animate-flicker" : "bulb-glow-off"
          }`}
          style={isOn ? { filter: `brightness(${0.6 + (brightness / 100) * 0.6})` } : undefined}
        >
          {/* Filament SVG */}
          <svg
            viewBox="0 0 100 100"
            className={`w-3/5 h-3/5 transition-all duration-700 ${
              isOn ? "opacity-90" : "opacity-30"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path
              d="M30 35 Q35 45 30 55 Q25 65 35 70 Q45 65 50 55 Q55 65 65 70 Q75 65 70 55 Q65 45 70 35"
              className={isOn ? "text-background/60" : "text-foreground/40"}
            />
            <line x1="35" y1="78" x2="65" y2="78" className={isOn ? "text-background/50" : "text-foreground/30"} />
            <line x1="38" y1="83" x2="62" y2="83" className={isOn ? "text-background/50" : "text-foreground/30"} />
          </svg>

          <Power
            className={`absolute w-8 h-8 transition-all duration-500 ${
              isOn ? "text-background/50" : "text-primary/70 group-hover:text-primary"
            }`}
            strokeWidth={2.5}
          />
        </div>

        {/* Bulb base (metallic) */}
        <div className="mx-auto -mt-2 w-20 sm:w-24 h-6 sm:h-8 rounded-b-md bg-gradient-to-b from-surface-3 to-background border-x border-b border-border shadow-inner" />
        <div className="mx-auto w-16 sm:w-20 h-2 rounded-b-sm bg-background border-x border-b border-border" />
      </button>

      {/* Status pill */}
      <div className="mt-10 flex items-center gap-3">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${
              isOn ? "bg-primary animate-ping opacity-75" : ""
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isOn ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
        </span>
        <span
          className={`font-mono text-xs uppercase tracking-[0.3em] transition-colors duration-500 ${
            isOn ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {isOn ? `Encendido · ${brightness}%` : "Apagado"}
        </span>
      </div>
    </div>
  );
};
