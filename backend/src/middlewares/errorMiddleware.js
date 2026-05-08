import { ZodError } from "zod";

export function errorMiddleware(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Dados inválidos.",
      errors: error.errors
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Erro interno no servidor."
  });
}
