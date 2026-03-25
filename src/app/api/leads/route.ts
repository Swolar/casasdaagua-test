import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = getDb();

    // Try to find existing lead by email or cpf
    let existing;
    if (body.email) {
      existing = db.prepare("SELECT * FROM leads WHERE email = ?").get(body.email) as { id: string } | undefined;
    }

    if (existing) {
      db.prepare(`
        UPDATE leads SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          cpf = COALESCE(?, cpf),
          phone = COALESCE(?, phone),
          step_reached = COALESCE(?, step_reached),
          updated_at = datetime('now')
        WHERE id = ?
      `).run(
        body.firstName || null,
        body.lastName || null,
        body.cpf || null,
        body.phone || null,
        body.stepReached || null,
        existing.id
      );
      return NextResponse.json({ id: existing.id, updated: true });
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO leads (id, email, first_name, last_name, cpf, phone, step_reached)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.email || null,
      body.firstName || null,
      body.lastName || null,
      body.cpf || null,
      body.phone || null,
      body.stepReached || "dados"
    );

    return NextResponse.json({ id, created: true });
  } catch (error) {
    console.error("Error saving lead:", error);
    return NextResponse.json({ error: "Erro ao salvar lead" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value || req.headers.get("authorization")?.replace("Bearer ", "") || "";
  if (!verifyAdminToken(token)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const db = getDb();
    const leads = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error listing leads:", error);
    return NextResponse.json({ error: "Erro ao listar leads" }, { status: 500 });
  }
}
