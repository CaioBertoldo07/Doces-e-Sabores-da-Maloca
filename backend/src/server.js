import dotenv from "dotenv";
import app from "./app.js";
import prisma from "./config/database.js";

// Carregar variáveis de ambiente
dotenv.config();

const PORT = process.env.PORT || 3000;

// Iniciar servidor
const server = app.listen(PORT, async () => {
  console.log(`\n🍬 ════════════════════════════════════════════════════════`);
  console.log(`   Doces e Sabores da Maloca - API Backend`);
  console.log(`   ════════════════════════════════════════════════════════`);
  console.log(`   🚀 Servidor rodando na porta: ${PORT}`);
  console.log(`   🌐 URL: http://localhost:${PORT}`);
  console.log(`   📊 Health Check: http://localhost:${PORT}/health`);
  console.log(`   ⚙️  Ambiente: ${process.env.NODE_ENV || "development"}`);

  // Testa conexão com banco de dados
  try {
    await prisma.$connect();
    console.log(`   ✅ Banco de dados conectado com sucesso`);
  } catch (error) {
    console.log(`   ❌ Erro ao conectar ao banco de dados`);
    console.error(error);
  }

  console.log(`   ════════════════════════════════════════════════════════\n`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("\n🛑 SIGTERM recebido. Encerrando servidor...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Servidor encerrado com sucesso\n");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("\n🛑 SIGINT recebido. Encerrando servidor...");

  server.close(async () => {
    await prisma.$disconnect();
    console.log("✅ Servidor encerrado com sucesso\n");
    process.exit(0);
  });
});
