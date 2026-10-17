import { NextRequest, NextResponse } from "next/server";
import { actualizarOrdenAdmin, deducirStockOrdenAdmin } from "../../../../lib/ordenes-db-admin";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orden } = await req.json();
    const { id } = params;

    if (!orden) {
      return NextResponse.json({ error: "Orden es requerida" }, { status: 400 });
    }

    // Si es transferencia, el stock ya fue reservado al crear la orden
    if (orden.metodoPago === "transferencia") {
      await actualizarOrdenAdmin(id, { estado: "aprobada" });
    } else {
      // Para otros métodos, deducir stock cuando se aprueba
      await deducirStockOrdenAdmin(id);
      await actualizarOrdenAdmin(id, { estado: "aprobada" });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error aprobando orden:", error);
    return NextResponse.json({ error: error.message || "Error al aprobar orden" }, { status: 500 });
  }
}
