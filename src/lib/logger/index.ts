type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "authorization",
  "nik",
  "no_ktp",
  "rekam_medis",
  "diagnosa",
  "keluhan",
]);

function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const sanitizedContext = context ? sanitizeData(context) : undefined;
    const payload = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(sanitizedContext ? { context: sanitizedContext } : {}),
    };

    if (level === "error") {
      console.error(JSON.stringify(payload));
    } else if (level === "warn") {
      console.warn(JSON.stringify(payload));
    } else {
      console.log(JSON.stringify(payload));
    }
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, context);
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    this.log("info", message, context);
  },

  warn(message: string, context?: Record<string, unknown>) {
    this.log("warn", message, context);
  },

  error(message: string, context?: Record<string, unknown>) {
    this.log("error", message, context);
  },
};

