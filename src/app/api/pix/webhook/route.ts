import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    // PagouAi webhook format: { id, type, objectId, data }
    if (body.type === "transaction" && body.data) {
      const txData = body.data;
      const pagouaiId = txData.id || body.objectId;
      const status = txData.status;

      if (pagouaiId) {
        const pixPayment = db.prepare("SELECT * FROM pix_payments WHERE pagouai_id = ?").get(Number(pagouaiId)) as {
          order_id: string; status: string;
        } | undefined;

        if (pixPayment && pixPayment.status !== "paid" && status === "paid") {
          db.prepare("UPDATE pix_payments SET status = 'paid', paid_at = datetime('now') WHERE order_id = ?").run(pixPayment.order_id);
          db.prepare("UPDATE orders SET status = 'paid', updated_at = datetime('now') WHERE id = ?").run(pixPayment.order_id);
          return NextResponse.json({ success: true, message: "Pagamento confirmado via PagouAi" });
        }

        if (pixPayment) {
          return NextResponse.json({ message: "Pagamento já processado" });
        }
      }
    }

    // Legacy/manual webhook format: { orderId } or { pixCode }
    let pixPayment;
    if (body.orderId) {
      pixPayment = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(body.orderId);
    } else if (body.pixCode) {
      pixPayment = db.prepare("SELECT * FROM pix_payments WHERE pix_code = ?").get(body.pixCode);
    }

    if (!pixPayment) {
      return NextResponse.json({ error: "Pagamento PIX não encontrado" }, { status: 404 });
    }

    const pix = pixPayment as { order_id: string; status: string };

    if (pix.status === "paid") {
      return NextResponse.json({ message: "Pagamento já confirmado" });
    }

    db.prepare("UPDATE pix_payments SET status = 'paid', paid_at = datetime('now') WHERE order_id = ?").run(pix.order_id);
    db.prepare("UPDATE orders SET status = 'paid', updated_at = datetime('now') WHERE id = ?").run(pix.order_id);

    return NextResponse.json({ success: true, message: "Pagamento confirmado" });
  } catch (error) {
    console.error("Error processing PIX webhook:", error);
    return NextResponse.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
