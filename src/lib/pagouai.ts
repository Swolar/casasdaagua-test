const SECRET_KEY = process.env.PAGOUAI_SECRET_KEY || "";
const BASE_URL = "https://api.conta.pagou.ai/v1";

function getAuthHeader(): string {
  const encoded = Buffer.from(`${SECRET_KEY}:x`).toString("base64");
  return `Basic ${encoded}`;
}

export interface PagouAiCustomer {
  name: string;
  email: string;
  phone?: string;
  document: {
    number: string;
    type: "cpf" | "cnpj";
  };
  address?: {
    street: string;
    streetNumber: string;
    zipCode: string;
    neighborhood: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface PagouAiItem {
  title: string;
  unitPrice: number;
  quantity: number;
  tangible: boolean;
}

export interface PagouAiPixResponse {
  id: number;
  amount: number;
  status: string;
  secureId: string;
  secureUrl: string;
  pix: {
    qrcode: string;
    expirationDate: string;
    end2EndId: string | null;
    receiptUrl: string | null;
  } | null;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  createdAt: string;
}

export async function createPixTransaction(
  amountCents: number,
  customer: PagouAiCustomer,
  items: PagouAiItem[],
  postbackUrl?: string
): Promise<PagouAiPixResponse> {
  const body: Record<string, unknown> = {
    amount: amountCents,
    paymentMethod: "pix",
    customer,
    items,
    pix: { expiresInDays: 1 },
  };

  if (postbackUrl) {
    body.postbackUrl = postbackUrl;
  }

  const res = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "Authorization": getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PagouAi error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function getTransaction(transactionId: number): Promise<PagouAiPixResponse> {
  const res = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    headers: {
      "Authorization": getAuthHeader(),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`PagouAi error ${res.status}: ${JSON.stringify(err)}`);
  }

  return res.json();
}
