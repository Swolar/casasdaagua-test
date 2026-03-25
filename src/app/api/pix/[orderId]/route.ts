import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params;
    const db = getDb();
    const payment = db.prepare("SELECT * FROM pix_payments WHERE order_id = ?").get(orderId);

    if (!payment) {
      return NextResponse.json({ error: "Pagamento PIX não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ payment });
  } catch (error) {
    console.error("Error fetching PIX:", error);
    return NextResponse.json({ error: "Erro ao buscar pagamento PIX" }, { status: 500 });
  }
}
