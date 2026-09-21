import { prisma } from "@/lib/prisma";

const VALID_TYPES = ["CALL", "WEB", "ROUTE", "EMAIL"] as const;
type ClickType = (typeof VALID_TYPES)[number];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { businessId, type, page, referrerHost } = body as Record<string, unknown>;

  if (typeof businessId !== "number" || !Number.isInteger(businessId) || businessId <= 0) {
    return Response.json({ error: "Invalid business." }, { status: 400 });
  }

  if (typeof type !== "string" || !VALID_TYPES.includes(type as ClickType)) {
    return Response.json({ error: "Invalid click type." }, { status: 400 });
  }

  if (typeof page !== "string" || page.length === 0) {
    return Response.json({ error: "Invalid page." }, { status: 400 });
  }

  // No cookies, no IP - see docs/concept.md section 9.
  await prisma.clickEvent.create({
    data: {
      businessId,
      type: type as ClickType,
      page,
      referrerHost: typeof referrerHost === "string" ? referrerHost : null,
    },
  });

  return Response.json({ ok: true }, { status: 201 });
}
