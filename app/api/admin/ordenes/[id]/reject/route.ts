import { NextRequest, NextResponse } from "next/server";
import { actualizarOrdenAdmin, devolverStockOrdenAdmin } from "../../../../../lib/ordenes-db-admin";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orden, motivo } = await req.json();
    const { id } = params;

    if (!orden) {
      return NextResponse.json({ error: "Orden es requerida" }, { status: 400 });
    }

    // Si es transferencia, devolver el stock que fue reservado
    if (orden.metodoPago === "transferencia") {
      await devolverStockOrdenAdmin(id);
    }

    // Actualizar estado
    await actualizarOrdenAdmin(id, {
      estado: "rechazada",
      motivoRechazo: motivo || "Rechazada por el administrador",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error rechazando orden:", error);
    return NextResponse.json({ error: error.message || "Error al rechazar orden" }, { status: 500 });
  }
}
