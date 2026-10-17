import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

function buildRechazoEmailHTML(orden: any, tipo: "cliente" | "dueño"): string {
  const esCliente = tipo === "cliente";
  const motivoRechazo = orden.motivoRechazo || "No especificado";

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
        <!-- Header con gradiente rojo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #dc2626; border-radius: 12px 12px 0 0;">
          <tr>
            <td style="padding: 32px; text-align: center; color: white;">
              <div style="font-size: 48px; margin-bottom: 8px;">🚫</div>
              <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: bold;">Orden Rechazada</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                ${esCliente ? "Tu orden no pudo ser procesada" : "Orden rechazada"}
              </p>
            </td>
          </tr>
        </table>

        <!-- Número de orden y estado -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 24px 36px;">
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 4px; font-size: 12px; color: #666; font-weight: bold;">
                  Número de orden
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #dc2626;">
                  ${orden.orderId || "N/A"}
                </p>
                <p style="margin: 8px 0 0; font-size: 13px; color: #666;">
                  Estado: <strong style="color: #dc2626;">Rechazada</strong>
                </p>
                <p style="margin: 4px 0 0; font-size: 13px; color: #666;">
                  Fecha: ${new Date().toLocaleDateString("es-ES")}
                </p>
              </div>
            </td>
          </tr>
        </table>

        <!-- Motivo del rechazo -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding: 0 36px 24px;">
              <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: bold; color: #1f2937;">
                Motivo del rechazo
              </h2>
              <div style="background: #fef2f2; padding: 16px; border-radius: 8px; border: 1px solid #fecaca;">
                <p style="margin: 0; font-size: 14px; color: #7f1d1d; line-height: 1.6;">
                  ${motivoRechazo}
                </p>
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
                    ¿Qué puedes hacer?
                  </p>
                  <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #1f2937; line-height: 1.6;">
                    <li>Verifica que la transferencia sea correcta</li>
                    <li>Si hay un error, puedes intentar realizar el pago nuevamente</li>
                    <li>Si tienes dudas, contáctanos por WhatsApp o email</li>
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
        ? `🚫 Orden ${orden.orderId} - Rechazada`
        : `Orden rechazada - ${orden.orderId}`;

    console.log(`[send-rechazo-email] Enviando email ${tipo}:`, {
      to: toEmail,
      orderId: orden.orderId,
    });

    const emailResponse = await resend.emails.send({
      from: process.env.EMAIL_FROM_ADDRESS || "noreply@technothings.com",
      to: toEmail,
      subject,
      html: buildRechazoEmailHTML(orden, tipo),
      headers: {
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "Precedence": "transactional",
        "X-Mailer": "Resend",
      },
      reply_to: process.env.EMAIL_FROM_ADDRESS || "soporte@technothings.com",
    });

    console.log("[send-rechazo-email] Respuesta de Resend:", emailResponse);

    if (emailResponse.error) {
      throw new Error(`Resend error: ${JSON.stringify(emailResponse.error)}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[send-rechazo-email] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error al enviar correo de rechazo" },
      { status: 500 }
    );
  }
}
