import { env } from "./env.js";
import { logger } from "../lib/logger.js";

const ALLOWED_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
const ALLOWED_HEADERS = ["Authorization", "Content-Type", "X-Requested-With"];

export const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (env.corsAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn("Origem bloqueada pelo CORS.", { origin });
    return callback(new Error("Origem não permitida pelo CORS."));
  },
  credentials: true,
  methods: ALLOWED_METHODS,
  allowedHeaders: ALLOWED_HEADERS,
  optionsSuccessStatus: 204,
  maxAge: env.isProduction ? 600 : 0
};
