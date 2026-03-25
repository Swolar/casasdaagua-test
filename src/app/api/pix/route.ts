import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {

  try {
    const db = getDb();
    const payments = db.prepare(`
      SELECT p.*, o.customer_first_name, o.customer_last_name, o.customer_email
      FROM pix_payments p
      LEFT JOIN orders o ON p.order_id = o.id
      ORDER BY p.created_at DESC
    `).all();

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("Error listing PIX payments:", error);
    return NextResponse.json({ error: "Erro ao listar pagamentos PIX" }, { status: 500 });
  }
}
