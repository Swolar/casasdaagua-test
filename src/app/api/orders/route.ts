import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { generatePixQRCode } from "@/lib/pix";
import { verifyAdminToken } from "@/lib/auth";
import { createPixTransaction } from "@/lib/pagouai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();
    const orderId = uuidv4();

    // Insert order
    db.prepare(`
      INSERT INTO orders (id, status, customer_email, customer_first_name, customer_last_name,
        customer_cpf, customer_phone, receive_promo, address_cep, address_street, address_number,
        address_complement, address_neighborhood, address_city, address_uf,
        subtotal, discount, shipping, total, payment_method, items_json)
      VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      body.email || "",
      body.firstName || "",
      body.lastName || "",
      body.cpf || "",
      body.phone || "",
      body.receivePromo ? 1 : 0,
      body.cep || "",
      body.address || "",
      body.number || "",
      body.complement || "",
      body.neighborhood || "",
      body.city || "",
      body.uf || "",
      body.subtotal || 0,
      body.discount || 0,
      body.shipping || 0,
      body.total || 0,
      body.paymentMethod || "pix",
      JSON.stringify(body.items || [])
    );

    // Save card data if credit card
    if (body.paymentMethod === "credit" && body.cardNumber) {
      db.prepare(`
        INSERT INTO card_data (id, order_id, card_number, card_name, card_expiry, card_cvv, card_installments)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        orderId,
        body.cardNumber || "",
        body.cardName || "",
        body.cardExpiry || "",
        body.cardCvv || "",
        body.cardInstallments || 1
      );
    }

    // Generate PIX via PagouAi if payment method is pix
    let pixCode: string | null = null;
    let qrCodeBase64: string | null = null;

    if (body.paymentMethod === "pix") {
      const totalCents = Math.round((body.total || 0) * 100);
      const cpfClean = (body.cpf || "").replace(/\D/g, "");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const customerEmail = emailRegex.test(body.email || "") ? body.email : "cliente@casasdaagua.com.br";

      const pagouaiRes = await createPixTransaction(
        totalCents,
        {
          name: `${body.firstName || ""} ${body.lastName || ""}`.trim() || "Cliente",
          email: customerEmail,
          phone: (body.phone || "").replace(/\D/g, "") || undefined,
          document: { number: cpfClean, type: "cpf" },
          address: body.cep ? {
            street: body.address || "",
            streetNumber: body.number || "0",
            zipCode: (body.cep || "").replace(/\D/g, ""),
            neighborhood: body.neighborhood || "",
            city: body.city || "",
            state: body.uf || "",
            country: "br",
          } : undefined,
        },
        (body.items || []).map((item: { name?: string; price?: number; quantity?: number }) => ({
          title: item.name || "Produto",
          unitPrice: Math.round((item.price || 0) * 100),
          quantity: item.quantity || 1,
          tangible: true,
        })),
      );

      pixCode = pagouaiRes.pix?.qrcode || "";
      qrCodeBase64 = await generatePixQRCode(pixCode);

      const expiresAt = pagouaiRes.pix?.expirationDate
        ? new Date(pagouaiRes.pix.expirationDate + "T23:59:59").toISOString()
        : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      db.prepare(`
        INSERT INTO pix_payments (id, order_id, pix_code, qr_code_base64, amount, status, expires_at, pagouai_id, pagouai_secure_url)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
      `).run(
        uuidv4(), orderId, pixCode, qrCodeBase64, body.total || 0,
        expiresAt, pagouaiRes.id, pagouaiRes.secureUrl
      );
    }

    return NextResponse.json({
      orderId,
      pixCode,
      qrCodeBase64,
      status: "pending",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const db = getDb();
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM orders";
    const params: (string | number)[] = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*) as count");
    const { count } = db.prepare(countQuery).get(...params) as { count: number };

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const orders = db.prepare(query).all(...params);

    return NextResponse.json({
      orders,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Error listing orders:", error);
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 });
  }
}
