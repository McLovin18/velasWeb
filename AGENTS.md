# Sistema de Pago por Transferencia

## Descripción

Se ha implementado un sistema completo de pago por transferencia bancaria con las siguientes características:

- Modal de transferencia en el carrito con formulario completo
- Gestión de cuentas bancarias desde el panel de administración
- Sistema de reservas de stock (stock se reserva al crear orden, se libera al rechazar)
- Envío de emails automáticos al cliente y al dueño
- Validación de evidencia de transferencia
- Panel de pedidos actualizado para mostrar y manejar órdenes de transferencia

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env.local`:

```env
# Email del dueño para recibir notificaciones de nuevas órdenes
OWNER_EMAIL=tu-email@ejemplo.com

# API Key de Resend para envío de emails (ya debe existir)
RESEND_API_KEY=re_xxxxxxxxxxxxxxx

# Dominio de envío de emails (Resend) - formato: nombre@tudominio.com
# Ejemplo: pedidos@julianabasics.com.ec
EMAIL_FROM_ADDRESS=pedidos@julianabasics.com.ec

# Bucket de Firebase Storage (para subir evidencias de transferencia)
# Formato: proyecto-id.appspot.com
# Ejemplo: velasshop.appspot.com
FIREBASE_STORAGE_BUCKET=velasshop.appspot.com
```

## Estructura de Archivos Creados

### Base de Datos
- `app/lib/cuentas-bancarias-db.ts` - Funciones CRUD para cuentas bancarias

### Componentes
- `app/components/TransferenciaModal.tsx` - Modal completo con formulario de transferencia

### API Endpoints
- `app/api/upload/transferencia-evidencia/route.ts` - Subida de evidencia a Firebase Storage
- `app/api/ordenes/transferencia/route.ts` - Creación de órdenes de transferencia
- `app/api/email/send-transferencia-email/route.ts` - Email de orden recibida
- `app/api/email/send-aprobacion-email/route.ts` - Email de orden aprobada
- `app/api/email/send-rechazo-email/route.ts` - Email de orden rechazada

### Páginas de Administración
- `app/admin/cuentas-bancarias/page.tsx` - Gestión de cuentas bancarias

### Archivos Modificados
- `app/cart/page.tsx` - Agregado botón de transferencia y modal
- `app/components/Sidebar.tsx` - Agregado link a Cuentas Bancarias
- `app/components/BottomBar.tsx` - Agregado link a Cuentas Bancarias
- `app/lib/ordenes-db.ts` - Actualizadas funciones de stock para soportar variaciones
- `app/admin/pedidos/page.tsx` - Actualizado para mostrar y manejar transferencias

## Flujo del Sistema

1. **Cliente selecciona productos** → Agrega al carrito
2. **Cliente hace clic en "Pagar por Transferencia"** → Se abre el modal
3. **Cliente completa el formulario**:
   - Selección de ciudad y dirección
   - Datos personales (nombre, cédula/RUC, teléfono, email)
   - Selección de cuenta bancaria
   - Subida de evidencia de transferencia
4. **Sistema crea la orden** → Estado: "pendiente_pago"
5. **Sistema reserva el stock** → Stock de variaciones se reduce temporalmente
6. **Sistema envía emails**:
   - Al cliente: Confirmación de orden recibida
   - Al dueño: Notificación de nueva orden con datos del cliente y evidencia
7. **Administrador revisa la orden** en `/admin/pedidos`
8. **Administrador aprueba/rechaza**:
   - **Aprobar**: Estado cambia a "aprobada", se envían emails de aprobación
   - **Rechazar**: Stock se libera, se envían emails de rechazo con motivo

## Gestión de Stock

### Transferencias
- **Al crear orden**: Stock se reserva inmediatamente (se deduce)
- **Al aprobar**: Stock ya está reservado, no se vuelve a deducir
- **Al rechazar**: Stock se devuelve (se suma de nuevo)

### Otros métodos de pago
- **Al aprobar**: Stock se deduce
- **Al rechazar**: Stock se devuelve

Soporta tanto stock general como stock por variaciones (talla/color o variaciones dinámicas).

## Página de Cuentas Bancarias

Ubicación: `/admin/cuentas-bancarias`

Permite al administrador:
- Crear nuevas cuentas bancarias
- Editar cuentas existentes
- Eliminar cuentas (marcar como inactivas)
- Campos: Banco, Tipo (ahorros/corriente), Número, Titular, Cédula/RUC

## Configuración de Ciudades de Envío

Las ciudades están hardcodeadas en `app/components/TransferenciaModal.tsx`:

```typescript
const CIUDADES = [
  { id: "quito", nombre: "Quito", precio: 5 },
  { id: "guayaquil", nombre: "Guayaquil", precio: 5 },
  { id: "cuenca", nombre: "Cuenca", precio: 5 },
  { id: "ambato", nombre: "Ambato", precio: 5 },
  { id: "riobamba", nombre: "Riobamba", precio: 5 },
  { id: "manta", nombre: "Manta", precio: 5 },
  { id: "portoviejo", nombre: "Portoviejo", precio: 5 },
  { id: "loja", nombre: "Loja", precio: 5 },
  { id: "ibarra", nombre: "Ibarra", precio: 5 },
  { id: "esmeraldas", nombre: "Esmeraldas", precio: 5 },
];
```

Para cambiar precios o agregar más ciudades, modifica el array `CIUDADES`. La zona específica debe escribirse en el campo de dirección.

## Plantillas de Email

Todas las plantillas incluyen:
- Imágenes de productos en la primera columna
- Información completa de la orden
- Datos de envío
- Diseño responsive y profesional
- Colores consistentes con la marca

### Email de Transferencia Recibida
- **Cliente**: Confirma orden recibida, muestra cuenta bancaria seleccionada, pasos siguientes
- **Dueño**: Muestra datos completos del cliente, evidencia de transferencia

### Email de Aprobación
- **Cliente**: Confirma pago verificado, datos de envío, confirmación de preparación
- **Dueño**: Confirmación de aprobación

### Email de Rechazo
- **Cliente**: Motivo del rechazo, instrucciones para corregir
- **Dueño**: Notificación de rechazo

## Notas Importantes

1. **Evidencia de transferencia**: Se sube a Firebase Storage en la carpeta `evidencias-transferencia/`
2. **Tamaño máximo de evidencia**: 5MB
3. **Formatos aceptados**: Solo imágenes
4. **Stock por variaciones**: El sistema soporta tanto el sistema legacy (talla/color) como el nuevo sistema de variaciones dinámicas
5. **Emails**: Los emails se envían automáticamente, pero si fallan no interrumpen el flujo de la orden
6. **Dominio de Resend**: La variable `EMAIL_FROM_ADDRESS` debe usar un dominio verificado en tu cuenta de Resend. El dominio debe estar configurado con los registros DNS apropiados (SPF, DKIM) antes de poder enviar emails. Sigue la documentación de Resend para verificar tu dominio.
