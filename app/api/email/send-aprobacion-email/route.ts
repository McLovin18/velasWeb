import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Helper para convertir Timestamp de Firestore a Date
function formatDate(timestamp: any): string {
  if (!timestamp) return "N/A";
  
  // Si es un Timestamp de Firestore con método toDate
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toLocaleDateString("es-ES");
  }
  
  // Si es un Timestamp de Firestore con segundos y nanosegundos
  if (timestamp && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toLocaleDateString("es-ES");
  }
  
  // Si ya es un Date o string
  try {
    return new Date(timestamp).toLocaleDateString("es-ES");
  } catch {
    return "N/A";
  }
}

function buildAprobacionEmailHTML(orden: any, tipo: "cliente" | "dueño"): string {
  const esCliente = tipo === "cliente";
  const nombreDestinatario = esCliente
    ? orden.datosCliente?.nombre || "Cliente"
    : "Administrador";

  // Calcular subtotal de productos
  let subtotalProductos = 0;
  const productosRows = (orden.productos || [])
    .map((p: any) => {
      const precioUnitario = p.precioUnitario || 0;
      const subtotalProducto = precioUnitario * p.cantidad;
      subtotalProductos += subtotalProducto;
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
                  <div style="font-weight: 600; color: #584738; font-size: 14px;">${p.nombre}</div>
                  ${variacionesHTML}
                  <div style="margin-top: 4px; font-size: 13px; color: #B59E7D;">
                    Cantidad: ${p.cantidad} · Precio unitario: $${(p.precioUnitario || 0).toFixed(2)}
                  </div>
                </td>
                <td style="text-align: right; vertical-align: top; padding-top: 12px;">
                  <div style="font-weight: 600; color: #584738; font-size: 14px;">
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
<body style="font-family: Georgia, serif; background: #F1EADA; margin: 0; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <tr>
      <td>
        <!-- Header con color de marca -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #584738; border-radius: 12px 12px 0 0;">
          <tr>
            <td style="padding: 32px; text-align: center; color: #F1EADA;">
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: bold; font-family: Georgia, serif;">Orden Aprobada</h1>
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
              <div style="background: #F1EADA; border-left: 4px solid #B59E7D; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #584738; font-weight: bold;">
                  Numero de orden
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #584738;">
                  ${orden.orderId || "N/A"}
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #584738;">
                  Estado: <strong style="color: #584738;">Aprobada</strong>
                </p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #584738;">
                  Fecha de aprobacion: ${new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Datos de envío -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 36px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: bold; color: #584738;">
                Datos de envio
              </h2>
              <div style="background: #F1EADA; padding: 16px; border-radius: 8px; border: 1px solid #B59E7D;">
                <p style="margin: 4px 0; font-size: 13px; color: #584738;">
                  <strong>Ciudad:</strong> ${orden.datosEnvio?.nombreCiudad || orden.datosEnvio?.ciudad || "N/A"}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #584738;">
                  <strong>Direccion:</strong> ${orden.datosEnvio?.direccion || "N/A"}
                </p>
                <p style="margin: 4px 0; font-size: 13px; color: #584738;">
                  <strong>Costo de envio:</strong> $${(orden.datosEnvio?.costoEnvio || 0).toFixed(2)}
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
              <div style="background: #F1EADA; padding: 16px; border-radius: 8px; border: 1px solid #B59E7D;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #584738;">
                  <span>Subtotal productos</span>
                  <span>$${subtotalProductos.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: #584738;">
                  <span>Costo de envio</span>
                  <span>$${(orden.datosEnvio?.costoEnvio || 0).toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #584738; padding-top: 8px; border-top: 1px solid #B59E7D;">
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
                <div style="background: #F1EADA; padding: 16px; border-radius: 8px; border: 1px solid #B59E7D;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #584738;">
                    Tu pedido esta siendo preparado
                  </p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #584738; line-height: 1.6;">
                    <li>Procederemos a preparar tu pedido</li>
                    <li>Te notificaremos cuando sea enviado</li>
                    <li>Recibiras tu pedido en la direccion indicada</li>
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
        ? `Orden ${orden.orderId} - Aprobada`
        : `Orden aprobada - ${orden.orderId}`;

    console.log(`[send-aprobacion-email] Enviando email ${tipo}:`, {
      to: toEmail,
      orderId: orden.orderId,
    });

    const emailResponse = await resend.emails.send({
      from: `Pedidos JulianaBasics <${process.env.EMAIL_FROM_ADDRESS || "noreply@technothings.com"}>`,
      to: toEmail,
      subject,
      html: buildAprobacionEmailHTML(orden, tipo),
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Precedence": "transactional",
        "X-Mailer": "Resend",
      },
      replyTo: process.env.EMAIL_FROM_ADDRESS || "soporte@technothings.com",
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
