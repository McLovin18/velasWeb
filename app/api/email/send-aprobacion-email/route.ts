import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function buildAprobacionEmailHTML(orden: any, tipo: "cliente" | "dueño"): string {
  const esCliente = tipo === "cliente";
  const nombreDestinatario = esCliente
    ? orden.datosCliente?.nombre || "Cliente"
    : "Administrador";

  // Construir filas de productos con imágenes
  const productosRows = (orden.productos || [])
    .map((p: any) => {
      const variacionesHTML = p.selectedVariationsConNombres
        ? Object.entries(p.selectedVariationsConNombres)
            .map(
              ([attrId, attrData]: [string, any]) =>
                `<div style="font-size: 12px; color: #666; margin-top: 4px;">
                  • <strong>${attrData.nombre}:</strong> ${attrData.valor}
                </div>`
            )
            .join("")
        : p.selectedTalla && p.selectedColor
        ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">
            • Talla: ${p.selectedTalla} · Color: ${p.selectedColor}
          </div>`
        : "";

      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                ${p.imagenes?.[0] ? `
                  <td width="60" style="padding-right: 12px;">
                    <img src="${p.imagenes[0]}" alt="${p.nombre}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 8px; border: 1px solid #e5e7eb;" />
                  </td>
                ` : ""}
                <td>
                  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">${p.nombre}</div>
                  ${variacionesHTML}
                  <div style="margin-top: 4px; font-size: 13px; color: #6b7280;">
                    Cantidad: ${p.cantidad} · Precio unitario: $${(p.precioUnitario || 0).toFixed(2)}
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top; padding-top: 12px;">
                  <div style="font-weight: 600; color: #1f2937; font-size: 14px;">
                    $${((p.precioUnitario || 0) * p.cantidad).toFixed(2)}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
</head>
<body style="font-family: Arial, sans-serif; background: #f3f4f6; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td>
        <!-- Header con gradiente verde -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #059669; border-radius: 12px 12px 0 0;">
          <tr>
            <td style="padding: 32px; text-align: center; color: white;">
              
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: bold;">¡Orden Aprobada!</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                ${esCliente ? "Tu pago ha sido verificado" : "Orden aprobada exitosamente"}
              </p>
            </td>
          </tr>
        </table>

        <!-- Número de orden y estado -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 24px 36px;">
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #666; font-weight: bold;">
                  Número de orden
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">
                  ${orden.orderId || "N/A"}
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #666;">
                  Estado: <strong style="color: #059669;">Aprobada</strong>
                </p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #666;">
                  Fecha de aprobación: ${new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Datos de envío -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 36px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: bold; color: #1f2937;">
                📦 Datos de envío
              </h2>
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #86efac;">
                <p style="margin: 4px 0; font-size: 13px; color: #1f2937;">
                  <strong>Ciudad:</strong> ${orden.datosEnvio?.nombreCiudad || orden.datosEnvio?.ciudad || "N/A"}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #1f2937;">
                  <strong>Dirección:</strong> ${orden.datosEnvio?.direccion || "N/A"}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #1f2937;">
                  <strong>Costo de envío:</strong> $${(orden.datosEnvio?.costoEnvio || 0).toFixed(2)}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Tabla de productos -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 36px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: bold; color: #1f2937;">
                Productos
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${productosRows}
              </table>
            </td>
          </tr>
        </table>

        <!-- Total -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 36px 24px;">
              <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #86efac;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #6b7280;">
                  <span>Subtotal productos</span>
                  <span>$${((orden.total || 0) - (orden.datosEnvio?.costoEnvio || 0)).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #6b7280;">
                  <span>Costo de envío</span>
                  <span>$${(orden.datosEnvio?.costoEnvio || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #059669; padding-top: 8px; border-top: 1px solid #86efac;">
                  <span>Total pagado</span>
                  <span>$${(orden.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </td>
          </tr>
        </table>

        ${esCliente ? `
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 0 36px 24px;">
                <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e40af;">
                    🚀 Tu pedido está siendo preparado
                  </p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1f2937; line-height: 1.6;">
                    <li>Procederemos a preparar tu pedido</li>
                    <li>Te notificaremos cuando sea enviado</li>
                    <li>Recibirás tu pedido en la dirección indicada</li>
                  </ul>
                </div>
              </td>
            </tr>
          </table>
        ` : ""}

        <!-- Footer -->
        <tr>
          <td style="background: #f9f9f9; padding: 24px 36px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; border-radius: 0 0 12px 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Juliana Basics. Todos los derechos reservados.</p>
            <p style="margin: 8px 0 0;">Este es un correo automático, por favor no responder.</p>
          </td>
        </tr>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { orden, tipo } = await req.json();

    if (!orden) {
      return NextResponse.json(
        { error: "Orden es requerida" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Configurar destinatario y asunto según tipo
    const toEmail =
      tipo === "cliente"
        ? orden.datosCliente?.email
        : process.env.OWNER_EMAIL || "admin@technothings.com";
    const subject =
      tipo === "cliente"
        ? `✅ Orden ${orden.orderId} - Aprobada`
        : `Orden aprobada - ${orden.orderId}`;

    console.log(`[send-aprobacion-email] Enviando email ${tipo}:`, {
      to: toEmail,
      orderId: orden.orderId,
    });

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || "noreply@technothings.com",
      to: toEmail,
      subject,
      html: buildAprobacionEmailHTML(orden, tipo),
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Precedence": "transactional",
        "X-Mailer": "Resend",
      },
      reply_to: process.env.EMAIL_FROM_ADDRESS || "soporte@technothings.com",
    });

    console.log("[send-aprobacion-email] Respuesta de Resend:", emailResponse);

    if (emailResponse.error) {
      throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-aprobacion-email] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al enviar correo de aprobación" },
      { status: 500 }
    );
  }
}
