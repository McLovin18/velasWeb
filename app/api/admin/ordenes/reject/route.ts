import { NextRequest, NextResponse } from "next/server";
import { actualizarOrdenAdmin, devolverStockOrdenAdmin } from "@/app/lib/ordenes-db-admin";

export async function POST(req: NextRequest) {
  try {
    const { ordenId, orden, motivo } = await req.json();

    if (!ordenId || !orden) {
      return NextResponse.json({ error: "Orden ID y orden son requeridos" }, { status: 400 });
    }

    // Si es transferencia, devolver el stock que fue reservado
    if (orden.metodoPago === "transferencia") {
      await devolverStockOrdenAdmin(ordenId);
    }

    // Actualizar estado
    await actualizarOrdenAdmin(ordenId, {
      estado: "rechazada",
      motivoRechazo: motivo || "Rechazada por el administrador",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error rechazando orden:", error);
    return NextResponse.json({ error: error.message || "Error al rechazar orden" }, { status: 500 });
  }
}
