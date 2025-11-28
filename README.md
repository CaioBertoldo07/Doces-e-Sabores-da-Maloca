# 🍬 Doces e Sabores da Maloca — Plataforma Web

Plataforma completa para gerenciamento e vendas da marca **Doces e Sabores da Maloca**, unindo site público para clientes, painel administrativo para produção e entregas, e base preparada para integrações futuras com IA e IoT.  
Desenvolvida em **React + Node.js**, utilizando **MySQL + Prisma** como banco de dados.

---

## 📌 Visão Geral

O projeto tem como objetivo digitalizar e automatizar a operação da empresa Doces da Maloca, incluindo:

- Cardápio online
- Sistema de pedidos
- Checkout
- Rastreamento do pedido
- Painel administrativo (produção, estoque, entregas)
- Base preparada para recomendações inteligentes (IA)
- Futuras integrações com sensores (IoT)

---

## 🧱 Tecnologias

### **Frontend**
- React + Vite  
- React Router  
- Zustand  
- React Query  
- Tailwind CSS  
- ShadCN UI  

### **Backend**
- Node.js  
- Express  
- Prisma ORM  
- MySQL  
- JWT Authentication  
- Bcrypt  
- Zod  

---

## 🏗️ Arquitetura Geral

### **Backend (`/server`)**

src/
config/
controllers/
routes/
services/
repositories/
middlewares/
utils/
models/
app.js
server.js


### **Frontend (`/web`)**

src/
pages/
components/
layouts/
services/api/
store/
hooks/


---

## 📚 Modelos do Banco (Prisma)

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String
  role      String   // 'admin', 'producao', 'entrega'
  createdAt DateTime @default(now())
}

model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  price       Float
  imageUrl    String?
  createdAt   DateTime @default(now())
}

model Order {
  id         Int        @id @default(autoincrement())
  customerName  String
  customerPhone String
  address    String
  status     String     // 'pendente', 'em_producao', 'pronto', 'entrega', 'entregue'
  totalPrice Float
  items      OrderItem[]
  createdAt  DateTime @default(now())
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  quantity  Int
  productId Int
  orderId   Int
  product   Product @relation(fields: [productId], references: [id])
  order     Order   @relation(fields: [orderId], references: [id])
}

model Ingredient {
  id       Int      @id @default(autoincrement())
  name     String
  quantity Float    // unidade padrão (ex: kg)
}

model Production {
  id           Int      @id @default(autoincrement())
  productId    Int
  status       String    // 'preparando', 'no_fogo', 'resfriando', 'pronto'
  yieldAmount  Int
  startedAt    DateTime  @default(now())
  finishedAt   DateTime?
  product      Product   @relation(fields: [productId], references: [id])
}

model Delivery {
  id          Int      @id @default(autoincrement())
  orderId     Int
  deliveryMan Int
  status      String   // 'pendente', 'a_caminho', 'entregue'
  updatedAt   DateTime @default(now())
  order       Order    @relation(fields: [orderId], references: [id])
  user        User     @relation(fields: [deliveryMan], references: [id])
}
```
