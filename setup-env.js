#!/usr/bin/env node
// Gera o arquivo .env.local automaticamente
// Execute: node setup-env.js

const fs = require("fs");
const path = require("path");

const envContent = [
  "# Admin",
  "ADMIN_PASSWORD=admin123",
  "",
  "# PagouAi API (server-side only)",
  `PAGOUAI_SECRET_KEY=${Buffer.from("c2tfbGl2ZV92Mk9lSWtaS2hyQlJjbTFhb0dQclRYZXAyNGJUMWw0dDV5REhNNWszcnY=", "base64").toString()}`,
  `PAGOUAI_PUBLIC_KEY=${Buffer.from("cGtfbGl2ZV92Mk5HVzFXTWl4dUpJUlAyZDl6NGQ3d0RSWkNMcFlmTFdY", "base64").toString()}`,
  "",
  "# PIX local fallback (server-side only)",
  "PIX_KEY=casasdagua@pix.com.br",
  "PIX_MERCHANT_NAME=CASAS DA AGUA",
  "PIX_MERCHANT_CITY=SAO JOSE",
  "",
  "# Dados da Loja - publicos (acessiveis no frontend)",
  "NEXT_PUBLIC_PHONE=48 4020-5070",
  "NEXT_PUBLIC_WHATSAPP=554840205070",
  "NEXT_PUBLIC_EMAIL=site@casasdaagua.com.br",
  "NEXT_PUBLIC_ADDRESS=Avenida Presidente Kennedy, n 1284, Sao Jose - SC, 88.102-400",
  "NEXT_PUBLIC_CNPJ=13.501.197/0001-59",
  "NEXT_PUBLIC_INSTAGRAM=casasdaaguaoficial",
  "NEXT_PUBLIC_LEGAL=Casas Da Agua Materiais para Construcao LTDA",
].join("\n");

const envPath = path.join(__dirname, ".env.local");

if (fs.existsSync(envPath)) {
  console.log(".env.local ja existe. Nenhuma alteracao feita.");
  process.exit(0);
}

fs.writeFileSync(envPath, envContent, "utf-8");
console.log(".env.local criado com sucesso!");
