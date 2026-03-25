import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createAdminSession, deleteAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!verifyPassword(password)) {
      return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
    }

    const token = createAdminSession();

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24h
    });

    return response;
  } catch (error) {
    console.error("Error in admin auth:", error);
    return NextResponse.json({ error: "Erro na autenticação" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("admin_token")?.value;
    if (token) {
      deleteAdminSession(token);
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete("admin_token");
    return response;
  } catch (error) {
    console.error("Error in admin logout:", error);
    return NextResponse.json({ error: "Erro ao fazer logout" }, { status: 500 });
  }
}
