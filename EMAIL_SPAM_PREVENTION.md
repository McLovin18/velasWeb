# Prevención de Spam en Correos Electrónicos

## Causas Comunes de Spam

### 1. **Dominio No Verificado**
- ❌ Usar `noreply@gmail.com` o dominios gratuitos
- ✅ Usar tu propio dominio verificado en Resend
- Tu dominio debe estar verificado con registros DNS (SPF, DKIM)

### 2. **Configuración DNS Incompleta**
Asegúrate de tener estos registros DNS configurados:

#### SPF (Sender Policy Framework)
```
txt @ v=spf1 include:_spf.google.com include:resend.com ~all
```

#### DKIM (DomainKeys Identified Mail)
Resend te proporcionará un registro DKIM que debes agregar. Ejemplo:
```
resend._domainkey.yourdomain.com
```

#### DMARC (Domain-based Message Authentication, Reporting & Conformance)
```
_dmarc.yourdomain.com
v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
```

### 3. **Contenido del Email**

#### Evitar en Asunto:
- ❌ TODO MAYÚSCULAS
- ❌ Múltiples signos de exclamación !!!
- ❌ Palabras spam: "GRATIS", "OFERTA", "GANAR", "URGENTE"
- ✅ Asunto claro y profesional

#### Evitar en Cuerpo:
- ❌ Texto todo en mayúsculas
- ❌ Enlaces sospechosos o acortadores
- ❌ Demasiados enlaces
- ❌ Imágenes grandes sin texto alternativo
- ✅ Balance entre texto e imágenes
- ✅ HTML limpio y bien formateado

### 4. **Prácticas de Envío**

#### Frecuencia:
- ❌ Enviar el mismo email múltiples veces
- ❌ Enviar a muchos destinatarios de golpe
- ✅ Rate limiting (usar límites de envío)
- ✅ Verificar antes de enviar en masa

#### Listas de Destinatarios:
- ❌ Comprar listas de emails
- ❌ Enviar a emails no validados
- ✅ Solo enviar a clientes que optaron por recibir emails
- ✅ Limpiar listas regularmente (eliminar rebotes)

### 5. **Reputación del Dominio**

#### Factores que afectan:
- Historial de envíos del dominio
- Quejas de spam de usuarios
- Ratio de rebotes (bounces)
- Ratio de spam reports

#### Cómo mejorar:
- Usar subdominios para diferentes tipos de emails (ej: `notificaciones@`, `promociones@`)
- Monitorear métricas de entrega
- Eliminar emails que rebotan inmediatamente
- Permitir unsubscribes fáciles

## Recomendaciones Específicas para Resend

### 1. Verificar Dominio en Resend
1. Ve a resend.com → Domains
2. Agrega tu dominio: `julianabasics.com.ec`
3. Agrega los registros DNS que Resend te indica
4. Espera la verificación (puede tardar horas o días)

### 2. Usar Dirección de Envío Apropiada
```env
EMAIL_FROM_ADDRESS=pedidos@julianabasics.com.ec
```

No uses:
- `noreply@gmail.com`
- `notifications@gmail.com`
- Dominios gratuitos

### 3. Agregar Headers de Email
Los headers ya están configurados correctamente:
```typescript
headers: {
  "X-Priority": "3",
  "X-MSMail-Priority": "Normal",
  "Precedence": "transactional",
  "X-Mailer": "Resend",
}
```

### 4. Incluir Link de Unsubscribe
Importante para cumplir con CAN-SPAM:
```typescript
headers: {
  "List-Unsubscribe": "<mailto:unsubscribe@julianabasics.com.ec>",
}
```

### 5. Usar Precedence Correcta
- `transactional` para emails de órdenes, confirmaciones
- `bulk` para newsletters (con cuidado)

## Verificación de Entrega

### Testear antes de enviar en masa:
1. Usa [Mail Tester](https://www.mail-tester.com/)
2. Usa [Gmail Spam Test](https://www.gmail.com/spam/lookup)
3. Envía emails de prueba a tus propias cuentas
4. Verifica si llegan a Inbox o Spam

### Monitoreo:
- Resend proporciona dashboard de entregabilidad
- Revisa métricas: open rate, click rate, bounce rate
- Activa alertas para alta tasa de spam

## Configuración Actual (Juliana Basics)

### ✅ Lo que ya está bien configurado:
- ✅ Dominio personalizado en Resend
- ✅ Plantillas HTML profesionales
- ✅ Headers apropiados (Precedence: transactional)
- ✅ Balance de texto e imágenes
- ✅ Asuntos claros y profesionales

### 🔧 Mejoras recomendadas:
1. **Verificar dominio en Resend** si aún no lo has hecho
2. **Configurar registros DNS** (SPF, DKIM, DMARC)
3. **Testear entregabilidad** con herramientas externas
4. **Monitorear métricas** en dashboard de Resend
5. **Agregar link de unsubscribe** en el footer

## Si los emails van a spam

### Pasos inmediatos:
1. Verifica que el dominio esté verificado en Resend
2. Revisa registros DNS (SPF, DKIM)
3. Verifica que el contenido no tenga palabras spam
4. Verifica la reputación del dominio en [Google Postmaster Tools](https://postmaster.google.com/)
5. Reduce la frecuencia de envíos temporalmente

### Solución a largo plazo:
- Usar subdominios dedicados (ej: `envios@julianabasics.com.ec`)
- Implementar DKIM firmado
- Configurar DMARC con política estricta
- Monitorear continuamente métricas
- Responder rápidamente a quejas

## Recursos Útiles

- [Resend Documentation on Deliverability](https://resend.com/docs/deliverability)
- [Google Postmaster Tools](https://postmaster.google.com/)
- [MXToolbox](https://mxtoolbox.com/)
- [Mail-Tester.com](https://www.mail-tester.com/)
