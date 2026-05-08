import { useEffect, useRef, useState } from "react";
import mqtt from "mqtt";

export type LightEvent = {
  id: string;
  onAt: number;
  offAt: number | null;
  brightness?: number; // 0-100
};

export type Settings = {
  wattage: number;
  pricePerKwh: number;
  brightness: number; // 0-100
  autoOffMinutes: number; // 0 = disabled
  monthlyBudget: number; // currency
};

const EVENTS_KEY = "lumenos.events.v6";
const SETTINGS_KEY = "lumenos.settings.v6";
const STATE_KEY = "lumenos.state.v6";

const defaultSettings: Settings = {
  wattage: 60,
  pricePerKwh: 0.15,
  brightness: 100,
  autoOffMinutes: 0,
  monthlyBudget: 5,
};

function loadEvents(): LightEvent[] {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function loadState(): boolean {
  return false;
}

export function useLightController() {
  const [events, setEvents] = useState<LightEvent[]>(() => loadEvents());
  const mqttClient = useRef<mqtt.MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Forzar limpieza completa en caso de que React guarde el estado en memoria por HMR
  useEffect(() => {
    setIsOn(false);
    setEvents([]);
  }, []);

  // Inicializar conexión MQTT
  useEffect(() => {
    // Usamos WebSockets (wss://) porque la página está en Vercel (HTTPS)
    const client = mqtt.connect("wss://broker.emqx.io:8084/mqtt");
    mqttClient.current = client;

    client.on("connect", () => {
      console.log("Conectado al broker MQTT (LuminaOS Web)");
      // Nos suscribimos al topic de estado para saber si el Arduino realmente está conectado
      client.subscribe("luminaos/esp32_foco/status");
    });

    client.on("message", (topic, payload) => {
      if (topic === "luminaos/esp32_foco/status") {
        const status = payload.toString();
        if (status === "online") {
          setIsConnected(true);
        } else if (status === "offline") {
          setIsConnected(false);
        }
      }
    });

    client.on("close", () => {
      setIsConnected(false);
    });

    client.on("offline", () => {
      setIsConnected(false);
    });

    client.on("error", (err) => {
      console.error("Error de conexión MQTT:", err);
      setIsConnected(false);
    });

    return () => {
      if (client) {
        client.end();
      }
    };
  }, []);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [isOn, setIsOn] = useState<boolean>(() => loadState());
  const [currentSessionStart, setCurrentSessionStart] = useState<number | null>(
    () => {
      const evts = loadEvents();
      const last = evts[evts.length - 1];
      if (loadState() && last && last.offAt === null) return last.onAt;
      return null;
    }
  );
  const autoOffTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STATE_KEY, isOn ? "on" : "off");
  }, [isOn]);

  const turnOff = () => {
    const now = Date.now();
    setEvents((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].offAt === null) {
          copy[i] = { ...copy[i], offAt: now };
          break;
        }
      }
      return copy;
    });
    setCurrentSessionStart(null);
    setIsOn(false);
    if (autoOffTimer.current) {
      clearTimeout(autoOffTimer.current);
      autoOffTimer.current = null;
    }
    
    // Publicar mensaje MQTT
    if (mqttClient.current) {
      mqttClient.current.publish("luminaos/esp32_foco/control", "OFF");
      console.log("MQTT: Enviado OFF");
    }
  };

  const turnOn = () => {
    if (!isConnected) return;
    const now = Date.now();
    const newEvent: LightEvent = {
      id: `evt-${now}`,
      onAt: now,
      offAt: null,
      brightness: settings.brightness,
    };
    setEvents((prev) => [...prev, newEvent]);
    setCurrentSessionStart(now);
    setIsOn(true);

    // Publicar mensaje MQTT
    if (mqttClient.current) {
      mqttClient.current.publish("luminaos/esp32_foco/control", "ON");
      console.log("MQTT: Enviado ON");
    }
  };

  const toggle = () => {
    if (!isConnected) return;
    if (isOn) turnOff();
    else turnOn();
  };

  // Auto-off timer
  useEffect(() => {
    if (autoOffTimer.current) {
      clearTimeout(autoOffTimer.current);
      autoOffTimer.current = null;
    }
    if (isOn && settings.autoOffMinutes > 0 && currentSessionStart) {
      const elapsed = Date.now() - currentSessionStart;
      const remaining = settings.autoOffMinutes * 60000 - elapsed;
      if (remaining > 0) {
        autoOffTimer.current = setTimeout(() => turnOff(), remaining);
      } else {
        turnOff();
      }
    }
    return () => {
      if (autoOffTimer.current) clearTimeout(autoOffTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn, settings.autoOffMinutes, currentSessionStart]);

  const clearHistory = () => {
    setEvents([]);
    if (isOn) {
      // Restart current session entry
      const now = Date.now();
      setEvents([{ id: `evt-${now}`, onAt: now, offAt: null, brightness: settings.brightness }]);
      setCurrentSessionStart(now);
    }
  };

  return {
    isOn,
    toggle,
    turnOn,
    turnOff,
    events,
    settings,
    setSettings,
    currentSessionStart,
    clearHistory,
    isConnected,
    setIsOn,
  };
}

// Helpers
export function totalActiveMs(events: LightEvent[], from?: number, to?: number) {
  const now = Date.now();
  const start = from ?? 0;
  const end = to ?? now;
  let total = 0;
  for (const e of events) {
    const eStart = Math.max(e.onAt, start);
    const eEnd = Math.min(e.offAt ?? now, end);
    if (eEnd > eStart) total += eEnd - eStart;
  }
  return total;
}

export function kwhFromMs(ms: number, wattage: number, brightnessPct = 100) {
  const hours = ms / 3600000;
  // Brightness affects effective consumption linearly (simulated)
  const effectiveW = wattage * (brightnessPct / 100);
  return (effectiveW * hours) / 1000;
}

export function totalKwh(events: LightEvent[], wattage: number, from?: number, to?: number) {
  const now = Date.now();
  const start = from ?? 0;
  const end = to ?? now;
  let total = 0;
  for (const e of events) {
    const eStart = Math.max(e.onAt, start);
    const eEnd = Math.min(e.offAt ?? now, end);
    if (eEnd > eStart) {
      total += kwhFromMs(eEnd - eStart, wattage, e.brightness ?? 100);
    }
  }
  return total;
}

export function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function exportToCsv(events: LightEvent[], wattage: number) {
  const now = Date.now();
  const rows = [["fecha_inicio", "hora_inicio", "hora_fin", "duracion_min", "brillo_pct", "kwh"]];
  for (const e of events) {
    const start = new Date(e.onAt);
    const end = e.offAt ? new Date(e.offAt) : null;
    const ms = (e.offAt ?? now) - e.onAt;
    rows.push([
      start.toLocaleDateString("es-ES"),
      start.toLocaleTimeString("es-ES"),
      end ? end.toLocaleTimeString("es-ES") : "(activo)",
      (ms / 60000).toFixed(2),
      String(e.brightness ?? 100),
      kwhFromMs(ms, wattage, e.brightness ?? 100).toFixed(4),
    ]);
  }
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lumenos-historial-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
