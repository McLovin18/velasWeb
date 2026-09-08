import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase-admin";

export const dynamic = "force-dynamic";

function serializeValue(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null || typeof value !== "object") return value;

  if (typeof (value as { toMillis?: () => number }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }

  if (Array.isArray(value)) return value.map(serializeValue);

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      serializeValue(item),
    ])
  );
}

export async function GET() {
  try {
    const snapshot = await db.collection("productos").get();
    const products = snapshot.docs.map((document) => ({
      id: document.id,
      ...serializeValue(document.data()),
    }));

    return NextResponse.json(
      { products },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("[Catalog API] Error loading products:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el catálogo" },
      { status: 503 }
    );
  }
}
