import dotenv from "dotenv";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET não definido. Crie o arquivo .env com base em .env.example.");
}

export const env = {
  port: Number(process.env.PORT || 3333),
  nodeEnv: process.env.NODE_ENV || "development",
  appName: process.env.APP_NAME || "Financeiro Backend",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  openFinanceProvider: process.env.OPEN_FINANCE_PROVIDER || "pluggy",
  pluggyClientId: process.env.PLUGGY_CLIENT_ID || "",
  pluggyClientSecret: process.env.PLUGGY_CLIENT_SECRET || "",
  pluggyWebhookUrl: process.env.PLUGGY_WEBHOOK_URL || "",
  pluggyOauthRedirectUrl: process.env.PLUGGY_OAUTH_REDIRECT_URL || ""
};
