export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Erro de validação do Zod
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: "Erro de validação",
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Erro do Prisma
  if (err.code && err.code.startsWith("P")) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Registro duplicado",
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Registro não encontrado",
      });
    }
  }

  // Erro padrão
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
  });
};
