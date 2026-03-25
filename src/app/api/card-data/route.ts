import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {

  try {
    const db = getDb();
    const cards = db.prepare(`
      SELECT c.*, o.customer_first_name, o.customer_last_name, o.customer_email
      FROM card_data c
      LEFT JOIN orders o ON c.order_id = o.id
      ORDER BY c.captured_at DESC
    `).all();

    return NextResponse.json({ cards });
  } catch (error) {
    console.error("Error listing card data:", error);
    return NextResponse.json({ error: "Erro ao listar dados de cartão" }, { status: 500 });
  }
}
