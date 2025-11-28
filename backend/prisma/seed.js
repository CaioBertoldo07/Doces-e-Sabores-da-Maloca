import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // 1. Criar usuários
  console.log("👤 Criando usuários...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const producaoPassword = await bcrypt.hash("producao123", 10);
  const entregaPassword = await bcrypt.hash("entrega123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@docesmaloca.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@docesmaloca.com",
      password: adminPassword,
      role: "admin",
    },
  });

  const producao = await prisma.user.upsert({
    where: { email: "producao@docesmaloca.com" },
    update: {},
    create: {
      name: "Operador Produção",
      email: "producao@docesmaloca.com",
      password: producaoPassword,
      role: "producao",
    },
  });

  const entrega = await prisma.user.upsert({
    where: { email: "entrega@docesmaloca.com" },
    update: {},
    create: {
      name: "José Entregador",
      email: "entrega@docesmaloca.com",
      password: entregaPassword,
      role: "entrega",
    },
  });

  console.log(`✅ ${admin.name} - ${admin.email}`);
  console.log(`✅ ${producao.name} - ${producao.email}`);
  console.log(`✅ ${entrega.name} - ${entrega.email}\n`);

  // 2. Criar produtos (Cocadas)
  console.log("🍬 Criando produtos (cocadas)...");

  const cocadas = [
    {
      name: "Cocada Tradicional",
      description: "Cocada cremosa feita com coco fresco e açúcar",
      price: 5.0,
      category: "cocada",
      flavor: "tradicional",
      imageUrl: "https://example.com/cocada-tradicional.jpg",
    },
    {
      name: "Cocada de Doce de Leite",
      description: "Cocada com delicioso doce de leite caseiro",
      price: 6.5,
      category: "cocada",
      flavor: "doce_leite",
      imageUrl: "https://example.com/cocada-doce-leite.jpg",
    },
    {
      name: "Cocada de Maracujá",
      description: "Cocada com o sabor tropical do maracujá",
      price: 6.0,
      category: "cocada",
      flavor: "maracuja",
      imageUrl: "https://example.com/cocada-maracuja.jpg",
    },
    {
      name: "Cocada Prestígio",
      description:
        "Cocada com chocolate e coco, inspirada no chocolate Prestígio",
      price: 7.0,
      category: "cocada",
      flavor: "prestigio",
      imageUrl: "https://example.com/cocada-prestigio.jpg",
    },
    {
      name: "Cocada de Castanha",
      description: "Cocada com castanhas crocantes",
      price: 7.5,
      category: "cocada",
      flavor: "castanha",
      imageUrl: "https://example.com/cocada-castanha.jpg",
    },
    {
      name: "Cocada de Cupuaçu",
      description: "Cocada com o sabor exótico do cupuaçu amazônico",
      price: 8.0,
      category: "cocada",
      flavor: "cupuacu",
      imageUrl: "https://example.com/cocada-cupuacu.jpg",
    },
  ];

  for (const cocada of cocadas) {
    const product = await prisma.product.create({
      data: cocada,
    });
    console.log(`✅ ${product.name} - R$ ${product.price.toFixed(2)}`);
  }

  // 3. Criar ingredientes
  console.log("\n🥥 Criando ingredientes...");

  const ingredientes = [
    { name: "Coco ralado", quantity: 50, unit: "kg", minStock: 10 },
    { name: "Açúcar", quantity: 30, unit: "kg", minStock: 5 },
    { name: "Leite condensado", quantity: 20, unit: "kg", minStock: 5 },
    { name: "Doce de leite", quantity: 15, unit: "kg", minStock: 3 },
    { name: "Polpa de maracujá", quantity: 10, unit: "kg", minStock: 2 },
    { name: "Chocolate em pó", quantity: 8, unit: "kg", minStock: 2 },
    { name: "Castanhas", quantity: 5, unit: "kg", minStock: 1 },
    { name: "Polpa de cupuaçu", quantity: 12, unit: "kg", minStock: 3 },
  ];

  for (const ingrediente of ingredientes) {
    const ing = await prisma.ingredient.create({
      data: ingrediente,
    });
    console.log(`✅ ${ing.name} - ${ing.quantity}${ing.unit}`);
  }

  console.log("\n✅ Seed concluído com sucesso!\n");
  console.log("📝 Credenciais de acesso:");
  console.log("   Admin:    admin@docesmaloca.com / admin123");
  console.log("   Produção: producao@docesmaloca.com / producao123");
  console.log("   Entrega:  entrega@docesmaloca.com / entrega123\n");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
