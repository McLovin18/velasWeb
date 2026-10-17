import { NextRequest, NextResponse } from "next/server";
import { actualizarOrdenAdmin, deducirStockOrdenAdmin } from "@/app/lib/ordenes-db-admin";

export async function POST(req: NextRequest) {
  try {
    const { ordenId, orden } = await req.json();

    console.log("[approve] Recibiendo solicitud:", { ordenId, metodoPago: orden?.metodoPago });

    if (!ordenId || !orden) {
      return NextResponse.json({ error: "Orden ID y orden son requeridos" }, { status: 400 });
    }

    // Si es transferencia, el stock ya fue reservado al crear la orden
    if (orden.metodoPago === "transferencia") {
      console.log("[approve] Actualizando orden de transferencia a aprobada");
      await actualizarOrdenAdmin(ordenId, { estado: "aprobada" });
      console.log("[approve] Orden actualizada exitosamente");
    } else {
      // Para otros métodos, deducir stock cuando se aprueba
      console.log("[approve] Deduciendo stock y actualizando orden");
      await deducirStockOrdenAdmin(ordenId);
      await actualizarOrdenAdmin(ordenId, { estado: "aprobada" });
      console.log("[approve] Orden actualizada exitosamente");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[approve] Error aprobando orden:", error);
    return NextResponse.json({ error: error.message || "Error al aprobar orden" }, { status: 500 });
  }
}
