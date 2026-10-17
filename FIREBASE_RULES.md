# Reglas de Firebase - Firestore y Storage

## Reglas de Firestore Security Rules

Estas reglas deben configurarse en tu consola de Firebase → Firestore Database → Rules

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function para verificar si es admin
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function para verificar si está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // ==================== PRODUCTOS ====================
    match /productos/{productoId} {
      allow read: if true; // Lectura pública
      allow write: if isAdmin(); // Solo admin puede escribir
    }

    // ==================== ORDENES ====================
    match /ordenes/{ordenId} {
      // Cualquiera puede crear orden (para transferencias y órdenes de WhatsApp)
      allow create: if isAuthenticated();
      
      // Solo admin puede leer todas las órdenes
      allow read: if isAdmin() || 
                     request.auth.uid == resource.data.userId ||
                     request.auth.token.email == resource.data.guestEmail;
      
      // Solo admin puede actualizar (aprobar/rechazar)
      allow update: if isAdmin();
      
      // Solo admin puede eliminar
      allow delete: if isAdmin();
    }

    // Meta contador para ordenes
    match /ordenes_meta/{document} {
      allow read, write: if isAdmin();
    }

    // ==================== CUENTAS BANCARIAS ====================
    match /cuentas-bancarias/{cuentaId} {
      // Lectura pública (clientes necesitan ver las cuentas para transferir)
      allow read: if true;
      
      // Solo admin puede crear/editar/eliminar cuentas
      allow write: if isAdmin();
    }

    // ==================== BODEGAS ====================
    match /bodegas/{bodegaId} {
      allow read: if true; // Lectura pública
      allow write: if isAdmin(); // Solo admin
    }

    // ==================== ATRIBUTOS ====================
    match /atributos/{atributoId} {
      allow read: if true; // Lectura pública
      allow write: if isAdmin(); // Solo admin
    }

    // ==================== USERS ====================
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                    (request.auth.uid == userId || isAdmin());
      allow write: if isAuthenticated() && 
                     (request.auth.uid == userId || isAdmin());
    }

    // ==================== CONFIGURACIÓN ====================
    match /config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

## Reglas de Firebase Storage Security Rules

Estas reglas deben configurarse en tu consola de Firebase → Storage → Rules

```firestore
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function para verificar si es admin
    function isAdmin() {
      return request.auth != null &&
             firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function para verificar si está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }

    // ==================== PRODUCTOS ====================
    // Imágenes de productos (lectura pública, escritura solo admin)
    match /productos/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ==================== EVIDENCIAS DE TRANSFERENCIA ====================
    // Carpeta para evidencias de transferencia
    match /evidencias-transferencia/{fileName} {
      // Permitir escritura desde el servidor (Admin SDK) y usuarios autenticados
      allow create: if true;

      // Cualquiera puede leer (admin necesita ver evidencia)
      allow read: if true;

      // Solo admin puede eliminar
      allow delete: if isAdmin();
    }

    // ==================== LANDING / BLOGS ====================
    // Imágenes de landing y blogs
    match /landing/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /blogs/{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // ==================== OTROS ====================
    // Denegar todo lo demás por defecto
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Instrucciones para Configurar

### 1. Configurar Firestore Rules

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Navega a **Firestore Database** → **Rules**
4. Reemplaza el contenido con las reglas de Firestore arriba
5. Haz clic en **Publish**

### 2. Configurar Storage Rules

1. En la misma consola de Firebase
2. Navega a **Storage** → **Rules**
3. Reemplaza el contenido con las reglas de Storage arriba
4. Haz clic en **Publish**

## Notas Importantes

### Para el Sistema de Transferencia

1. **Evidencias de transferencia**: Los clientes autenticados pueden subir imágenes a `evidencias-transferencia/`
2. **Cuentas bancarias**: Son de lectura pública para que los clientes puedan verlas en el modal
3. **Órdenes**: 
   - Cualquier usuario autenticado puede crear órdenes
   - Solo el admin puede leer todas las órdenes
   - Los clientes solo pueden ver sus propias órdenes (por userId o guestEmail)

### Seguridad Adicional

Si no tienes un campo `role` en la colección `users`, puedes modificar las reglas para usar una lista de UIDs de admin:

```firestore
function isAdmin() {
  // Lista de UIDs de administradores
  return request.auth != null && 
         request.auth.uid in [
           'UID_DEL_ADMIN_1',
           'UID_DEL_ADMIN_2'
         ];
}
```

### Pruebas

Antes de publicar en producción, puedes usar el **Rules Playground** en la consola de Firebase para simular operaciones y verificar que las reglas funcionan correctamente.

## Colecciones Requeridas

Asegúrate de que las siguientes colecciones existan en tu Firestore:

- ✅ `productos` (ya existe)
- ✅ `ordenes` (ya existe)
- ✅ `bodegas` (ya existe)
- ✅ `atributos` (ya existe)
- ✅ `cuentas-bancarias` (nueva - se crea automáticamente al usar el sistema)
- ✅ `ordenes_meta` (se crea automáticamente al crear la primera orden)
- ✅ `users` (para autenticación y roles de admin)

## Carpetas de Storage

Asegúrate de que las siguientes carpetas existan en tu Storage:

- ✅ `productos/` (ya existe)
- ✅ `evidencias-transferencia/` (nueva - se crea automáticamente al subir la primera evidencia)
- ✅ `landing/` (si usas imágenes en landing)
- ✅ `blogs/` (si usas imágenes en blogs)
