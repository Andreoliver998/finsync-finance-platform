import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

async function bootstrap() {
  try {
    await prisma.$connect();

    app.listen(env.port, () => {
      console.log(`🚀 ${env.appName} rodando em http://localhost:${env.port}`);
      console.log(`📌 Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

bootstrap();
