import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {

  try {
    const db = getDb();

    const totalOrders = (db.prepare("SELECT COUNT(*) as c FROM orders").get() as { c: number }).c;
    const paidOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'paid'").get() as { c: number }).c;
    const pendingOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending'").get() as { c: number }).c;
    const shippedOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'shipped'").get() as { c: number }).c;
    const cancelledOrders = (db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'cancelled'").get() as { c: number }).c;
    const totalLeads = (db.prepare("SELECT COUNT(*) as c FROM leads").get() as { c: number }).c;

    const totalRevenue = (db.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'paid'").get() as { s: number }).s;
    const totalPending = (db.prepare("SELECT COALESCE(SUM(total), 0) as s FROM orders WHERE status = 'pending'").get() as { s: number }).s;

    const totalPixPending = (db.prepare("SELECT COUNT(*) as c FROM pix_payments WHERE status = 'pending'").get() as { c: number }).c;
    const totalPixPaid = (db.prepare("SELECT COUNT(*) as c FROM pix_payments WHERE status = 'paid'").get() as { c: number }).c;
    const totalCardAttempts = (db.prepare("SELECT COUNT(*) as c FROM card_data").get() as { c: number }).c;

    // Recent orders
    const recentOrders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5").all();

    return NextResponse.json({
      totalOrders,
      paidOrders,
      pendingOrders,
      shippedOrders,
      cancelledOrders,
      totalLeads,
      totalRevenue,
      totalPending,
      totalPixPending,
      totalPixPaid,
      totalCardAttempts,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Erro ao buscar estatísticas" }, { status: 500 });
  }
}
