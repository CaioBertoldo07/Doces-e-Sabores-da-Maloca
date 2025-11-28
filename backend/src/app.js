import express from "express";
import cors from "cors";
import morgan from "morgan";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";

// Rotas
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";

const app = express();

// Middlewares globais
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Rota de health check
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "🍬 Doces da Maloca API está funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/production", productionRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/deliveries", deliveryRoutes);

// Tratamento de erros
app.use(notFound);
app.use(errorHandler);

export default app;
