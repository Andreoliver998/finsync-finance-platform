import { env } from "../config/env.js";

const SENSITIVE_KEYS = new Set([
  "authorization",
  "token",
  "accesstoken",
  "refreshtoken",
  "connecttoken",
  "password",
  "passwordhash",
  "secret",
  "clientsecret",
  "apikey",
  "databaseurl",
  "jwtsecret",
  "cookie"
]);

function normalizeKey(key) {
  return String(key).replace(/[-_]/g, "").toLowerCase();
}

function redact(value) {
  if (Array.isArray(value)) {
    return value.map(redact);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [
        key,
        SENSITIVE_KEYS.has(normalizeKey(key)) ? "[REDACTED]" : redact(entryValue)
      ])
    );
  }

  return value;
}

function write(level, message, meta) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta: redact(meta) } : {})
  };

  if (env.isProduction) {
    console[level === "error" ? "error" : "log"](JSON.stringify(payload));
    return;
  }

  console[level === "error" ? "error" : "log"](payload);
}

export const logger = {
  debug(message, meta) {
    if (!env.isProduction && env.logLevel === "debug") {
      write("debug", message, meta);
    }
  },
  info(message, meta) {
    write("info", message, meta);
  },
  warn(message, meta) {
    write("warn", message, meta);
  },
  error(message, meta) {
    write("error", message, meta);
  }
};
