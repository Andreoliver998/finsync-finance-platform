import dotenv from "dotenv";

dotenv.config();

const PRODUCTION_FRONTEND_URL = "https://finsync.paytech.app.br";
const PRODUCTION_API_URL = "https://api-finsync.paytech.app.br";
const REQUIRED_ALWAYS = ["JWT_SECRET", "DATABASE_URL"];
const REQUIRED_PRODUCTION = ["PLUGGY_CLIENT_ID", "PLUGGY_CLIENT_SECRET"];

function getNodeEnv() {
  return process.env.NODE_ENV || "development";
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function requireEnvironmentVariables() {
  const nodeEnv = getNodeEnv();
  const required = nodeEnv === "production"
    ? [...REQUIRED_ALWAYS, ...REQUIRED_PRODUCTION]
    : REQUIRED_ALWAYS;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(", ")}.`);
  }
}

function validateJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return;
  }

  if (getNodeEnv() === "production" && jwtSecret.length < 32) {
    throw new Error("JWT_SECRET deve ter pelo menos 32 caracteres em produção.");
  }
}

function buildAllowedOrigins() {
  const configuredOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  const developmentOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ];

  const productionOrigins = [PRODUCTION_FRONTEND_URL];
  const baseOrigins = getNodeEnv() === "production" ? productionOrigins : developmentOrigins;

  return Array.from(new Set([...baseOrigins, ...configuredOrigins]));
}

requireEnvironmentVariables();
validateJwtSecret();

export const env = {
  port: Number(process.env.PORT || 3333),
  nodeEnv: getNodeEnv(),
  isProduction: getNodeEnv() === "production",
  appName: process.env.APP_NAME || "FinSync",
  apiUrl: process.env.API_URL || PRODUCTION_API_URL,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",
  jwtIssuer: process.env.JWT_ISSUER || "finsync-api",
  jwtAudience: process.env.JWT_AUDIENCE || "finsync-web",
  frontendUrl: process.env.FRONTEND_URL || PRODUCTION_FRONTEND_URL,
  corsAllowedOrigins: buildAllowedOrigins(),
  openFinanceProvider: process.env.OPEN_FINANCE_PROVIDER || "pluggy",
  pluggyClientId: process.env.PLUGGY_CLIENT_ID || "",
  pluggyClientSecret: process.env.PLUGGY_CLIENT_SECRET || "",
  pluggyWebhookUrl: process.env.PLUGGY_WEBHOOK_URL || `${PRODUCTION_API_URL}/api/open-finance/webhook/pluggy`,
  pluggyOauthRedirectUrl: process.env.PLUGGY_OAUTH_REDIRECT_URL || `${PRODUCTION_FRONTEND_URL}/open-finance/callback`,
  pluggyIncludeSandbox: parseBoolean(process.env.PLUGGY_INCLUDE_SANDBOX, getNodeEnv() !== "production"),
  logLevel: process.env.LOG_LEVEL || (getNodeEnv() === "production" ? "info" : "debug")
};
