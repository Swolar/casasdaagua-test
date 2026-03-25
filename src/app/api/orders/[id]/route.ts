import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { generatePixQRCode } from "@/lib/pix";
import { createPixTransaction } from "@/lib/pagouai";
import { v4 as uuidv4 } from "uuid";
import { verifyAdminToken } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const db = getDb();
    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    const cardData = db.prepare("SELECT * FROM card_data WHERE order_id = ?").get(id);
    const pixPayment = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(id);

    return NextResponse.json({ order, cardData, pixPayment });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ error: "Erro ao buscar pedido" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = getDb();

    // Admin auth required for status updates, but not for switching to PIX (customer flow)
    const isPixSwitch = body.paymentMethod === "pix" && !body.status;
    if (!isPixSwitch) {
      const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "") || "";
      if (!verifyAdminToken(token)) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as {
      id: string; total: number; customer_first_name: string; customer_last_name: string;
      customer_email: string; customer_cpf: string; customer_phone: string;
      address_street: string; address_number: string; address_cep: string;
      address_neighborhood: string; address_city: string; address_uf: string;
      items_json: string;
    } | undefined;
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Update status
    if (body.status) {
      db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(body.status, id);

      if (body.status === "paid") {
        db.prepare("UPDATE pix_payments SET status = 'paid', paid_at = datetime('now') WHERE order_id = ?").run(id);
      }
    }

    // Switch payment method to PIX
    if (body.paymentMethod === "pix") {
      db.prepare("UPDATE orders SET payment_method = 'pix', updated_at = datetime('now') WHERE id = ?").run(id);

      const existingPix = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(id);
      if (!existingPix) {
        const totalCents = Math.round(order.total * 100);
        const cpfClean = (order.customer_cpf || "").replace(/\D/g, "");

        let items: { name: string; price: number; quantity: number }[] = [];
        try { items = JSON.parse(order.items_json || "[]"); } catch { /* empty */ }

        const pagouaiRes = await createPixTransaction(
          totalCents,
          {
            name: `${order.customer_first_name} ${order.customer_last_name}`.trim() || "Cliente",
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customer_email || "") ? order.customer_email : "cliente@casasdaagua.com.br",
            phone: (order.customer_phone || "").replace(/\D/g, "") || undefined,
            document: { number: cpfClean, type: "cpf" },
          },
          items.map((item) => ({
            title: item.name || "Produto",
            unitPrice: Math.round((item.price || 0) * 100),
            quantity: item.quantity || 1,
            tangible: true,
          })),
        );

        const pixCode = pagouaiRes.pix?.qrcode || "";
        const qrCodeBase64 = await generatePixQRCode(pixCode);
        const expiresAt = pagouaiRes.pix?.expirationDate
          ? new Date(pagouaiRes.pix.expirationDate + "T23:59:59").toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        db.prepare(`
          INSERT INTO pix_payments (id, order_id, pix_code, qr_code_base64, amount, status, expires_at, pagouai_id, pagouai_secure_url)
          VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)
        `).run(uuidv4(), id, pixCode, qrCodeBase64, order.total, expiresAt, pagouaiRes.id, pagouaiRes.secureUrl);

        const pixPayment = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(id);
        return NextResponse.json({ success: true, pixPayment });
      }

      const pixPayment = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(id);
      return NextResponse.json({ success: true, pixPayment });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
