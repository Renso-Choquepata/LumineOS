interface BrightnessSliderProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export const BrightnessSlider = ({ value, onChange, disabled }: BrightnessSliderProps) => {
  const presets = [25, 50, 75, 100];

  return (
    <div className={`glass-card rounded-2xl p-4 sm:p-5 transition-opacity ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-display text-sm font-semibold">Brillo</h4>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
            Controla la intensidad
          </p>
        </div>
        <span className="font-mono text-2xl font-bold text-gradient">{value}%</span>
      </div>

      <input
        type="range"
        min={10}
        max={100}
        step={5}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Brillo"
        className="w-full h-2 bg-surface-3 rounded-full appearance-none cursor-pointer accent-primary disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${value}%, hsl(var(--surface-3)) ${value}%, hsl(var(--surface-3)) 100%)`,
        }}
      />

      <div className="flex gap-1.5 mt-3">
        {presets.map((p) => (
          <button
            key={p}
            disabled={disabled}
            onClick={() => onChange(p)}
            className={`flex-1 rounded-lg py-1.5 text-[11px] font-mono border transition-all ${
              value === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            } disabled:cursor-not-allowed`}
          >
            {p}%
          </button>
        ))}
      </div>
    </div>
  );
};
