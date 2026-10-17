import admin from "./firebase-admin";
import { getCatalogPricing } from "./pricing";

const COLLECTION = "ordenes";

// Genera un número secuencial y lo convierte en ID tipo "ord-00001"
async function generarSiguienteOrderId(): Promise<string> {
  const db = admin.firestore();
  const metaRef = db.collection(`${COLLECTION}_meta`).doc("counter");
  const nextNumber = await db.runTransaction(async (tx) => {
    const snap = await tx.get(metaRef);
    const last = snap.exists ? (snap.data().lastNumber || 0) : 0;
    const next = last + 1;
    tx.set(metaRef, { lastNumber: next }, { merge: true });
    return next;
  });
  const padded = String(nextNumber).padStart(5, "0");
  return `ord-${padded}`;
}

export async function crearOrdenAdmin(orden: any) {
  const db = admin.firestore();
  const orderId = await generarSiguienteOrderId();

  const productosOrigen = Array.isArray(orden.productos) ? orden.productos : [];
  const productosProcesados: any[] = [];
  let total = 0;

  // ⚠️ Validar cantidades razonables (anti-ataque masivo)
  const MAX_QUANTITY_PER_ITEM = 10;
  for (const item of productosOrigen) {
    const cantidad = Number(item.cantidad || 1);
    if (cantidad > MAX_QUANTITY_PER_ITEM) {
      throw new Error(`Cantidad máxima permitida por producto: ${MAX_QUANTITY_PER_ITEM}`);
    }
    if (cantidad < 1) {
      throw new Error("Cantidad debe ser al menos 1");
    }
  }

  // 🚀 OPTIMIZACIÓN: Usar bulk read en lugar de getDoc individual
  const productRefs = productosOrigen
    .filter((item: any) => item?.id)
    .map((item: any) => db.collection("productos").doc(item.id));

  // Obtener todos de una vez (Admin SDK usa getAll)
  const productDocs = await db.getAll(...productRefs);

  const productDataMap = new Map<string, any>();
  for (const snap of productDocs) {
    if (snap.exists) {
      productDataMap.set(snap.id, snap.data());
    }
  }

  for (const item of productosOrigen) {
    if (!item?.id) continue;

    const data = productDataMap.get(item.id);
    if (!data) continue;

    const { basePrice, discount, hasDiscount, finalPrice } = getCatalogPricing(data);
    const cantidad = Number(item.cantidad || 1);
    const unitPrice = finalPrice;
    const lineTotal = unitPrice * cantidad;

    // ⚠️ VALIDACIÓN: Stock disponible (anti-overselling)
    const stock = Number(data.stock || 0);
    if (stock < cantidad) {
      throw new Error(
        `Stock insuficiente para "${data.nombre}". Disponibles: ${stock}, Solicitados: ${cantidad}`
      );
    }

    total += lineTotal;

    // Obtener información de la bodega si existe
    let tiempoEntrega = 72; // default
    if (data.bodegaId) {
      try {
        const bodegaRef = db.collection("bodegas").doc(data.bodegaId);
        const bodegaSnap = await bodegaRef.get();
        if (bodegaSnap.exists) {
          tiempoEntrega = bodegaSnap.data().tiempoEntrega || 72;
        }
      } catch (err) {
        console.error("Error obteniendo bodega:", err);
      }
    }

    // 💾 SNAPSHOT de precios: Protección contra disputas y cambios
    productosProcesados.push({
      id: item.id,
      nombre: data.nombre,
      cantidad,
      precioBase: basePrice,
      descuento: hasDiscount ? discount : 0,
      precioUnitario: unitPrice,
      precioFinal: unitPrice,
      subtotal: lineTotal,
      bodegaId: data.bodegaId || "technothings",
      tiempoEntrega,
      // 🔒 SNAPSHOT de seguridad
      precioSnapshot: {
        base: basePrice,
        descuento: discount,
        final: unitPrice,
        timestamp: Date.now(),
      },
      stockSnapshot: stock,
      // Incluir datos de variaciones
      selectedTalla: item.selectedTalla,
      selectedColor: item.selectedColor,
      selectedVariations: item.selectedVariations,
      variationAttributeIds: item.variationAttributeIds,
      selectedVariationsConNombres: item.selectedVariationsConNombres,
      personalizacionValues: item.personalizacionValues,
      personalizacionValuesConNombres: item.personalizacionValuesConNombres,
      // Incluir imagen del producto
      imagenes: data.imagenes,
    });
  }

  // Agregar costo de envío al total si existe
  const costoEnvio = Number(orden.datosEnvio?.costoEnvio || 0);
  const totalConEnvio = total + costoEnvio;

  const payload = {
    ...orden,
    productos: productosProcesados,
    total: totalConEnvio,
    orderId,
    estado: orden.estado || "generada",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(payload);
  
  // Leer el documento para obtener el Timestamp real de createdAt
  const docSnap = await docRef.get();
  const docData = docSnap.data();
  
  return { ...payload, ...docData, id: docRef.id };
}

export async function actualizarOrdenAdmin(id: string, data: any) {
  const db = admin.firestore();
  await db.collection(COLLECTION).doc(id).update(data);
}

// Deducir stock cuando se aprueba una orden (Admin SDK)
export async function deducirStockOrdenAdmin(orderId: string) {
  const db = admin.firestore();
  try {
    const ordenRef = db.collection(COLLECTION).doc(orderId);
    const ordenSnap = await ordenRef.get();

    if (!ordenSnap.exists) {
      throw new Error("Orden no encontrada");
    }

    const orden = ordenSnap.data();

    // Iterar sobre los productos y deducir stock
    for (const producto of orden.productos || []) {
      const prodRef = db.collection("productos").doc(producto.id);
      const prodSnap = await prodRef.get();

      if (prodSnap.exists) {
        const prodData = prodSnap.data();

        // Si el producto tiene variaciones, deducir de la variación específica
        if (prodData.hasVariations && Array.isArray(prodData.stockVariants)) {
          let variacionEncontrada = false;

          const newStockVariants = prodData.stockVariants.map((variant: any) => {
            let coincide = false;

            // Variaciones dinámicas (nuevo sistema)
            if (producto.selectedVariations && producto.variationAttributeIds) {
              coincide = producto.variationAttributeIds.every(
                (attrId: string) => variant.attributes?.[attrId] === producto.selectedVariations[attrId]
              );
            }
            // Variaciones legacy (talla/color)
            else if (producto.selectedTalla && producto.selectedColor) {
              coincide = variant.talla === producto.selectedTalla && variant.color === producto.selectedColor;
            }

            if (coincide) {
              variacionEncontrada = true;
              return {
                ...variant,
                cantidad: Math.max(0, (variant.cantidad || 0) - producto.cantidad),
              };
            }

            return variant;
          });

          if (variacionEncontrada) {
            await prodRef.update({ stockVariants: newStockVariants });
          } else {
            const stockActual = prodData.stock || 0;
            const nuevoStock = Math.max(0, stockActual - producto.cantidad);
            await prodRef.update({ stock: nuevoStock });
          }
        } else {
          const stockActual = prodData.stock || 0;
          const nuevoStock = Math.max(0, stockActual - producto.cantidad);
          await prodRef.update({ stock: nuevoStock });
        }
      }
    }
  } catch (err) {
    console.error("Error deduciendo stock:", err);
    throw err;
  }
}

// Reservar stock cuando se crea una orden de transferencia (Admin SDK)
export async function reservarStockOrdenAdmin(orderId: string) {
  const db = admin.firestore();
  try {
    const ordenRef = db.collection(COLLECTION).doc(orderId);
    const ordenSnap = await ordenRef.get();

    if (!ordenSnap.exists) {
      throw new Error("Orden no encontrada");
    }

    const orden = ordenSnap.data();

    // Iterar sobre los productos y reservar stock
    for (const producto of orden.productos || []) {
      const prodRef = db.collection("productos").doc(producto.id);
      const prodSnap = await prodRef.get();

      if (prodSnap.exists) {
        const prodData = prodSnap.data();

        // Si el producto tiene variaciones, reservar de la variación específica
        if (prodData.hasVariations && Array.isArray(prodData.stockVariants)) {
          let variacionEncontrada = false;

          const newStockVariants = prodData.stockVariants.map((variant: any) => {
            let coincide = false;

            // Variaciones dinámicas (nuevo sistema)
            if (producto.selectedVariations && producto.variationAttributeIds) {
              coincide = producto.variationAttributeIds.every(
                (attrId: string) => variant.attributes?.[attrId] === producto.selectedVariations[attrId]
              );
            }
            // Variaciones legacy (talla/color)
            else if (producto.selectedTalla && producto.selectedColor) {
              coincide = variant.talla === producto.selectedTalla && variant.color === producto.selectedColor;
            }

            if (coincide) {
              variacionEncontrada = true;
              return {
                ...variant,
                cantidad: Math.max(0, (variant.cantidad || 0) - producto.cantidad),
              };
            }

            return variant;
          });

          if (variacionEncontrada) {
            await prodRef.update({ stockVariants: newStockVariants });
          } else {
            const stockActual = prodData.stock || 0;
            const nuevoStock = Math.max(0, stockActual - producto.cantidad);
            await prodRef.update({ stock: nuevoStock });
          }
        } else {
          const stockActual = prodData.stock || 0;
          const nuevoStock = Math.max(0, stockActual - producto.cantidad);
          await prodRef.update({ stock: nuevoStock });
        }
      }
    }
  } catch (err) {
    console.error("Error reservando stock:", err);
    throw err;
  }
}

// Devolver stock cuando se rechaza una orden (Admin SDK)
export async function devolverStockOrdenAdmin(orderId: string) {
  const db = admin.firestore();
  try {
    const ordenRef = db.collection(COLLECTION).doc(orderId);
    const ordenSnap = await ordenRef.get();

    if (!ordenSnap.exists) {
      throw new Error("Orden no encontrada");
    }

    const orden = ordenSnap.data();

    // Iterar sobre los productos y devolver stock
    for (const producto of orden.productos || []) {
      const prodRef = db.collection("productos").doc(producto.id);
      const prodSnap = await prodRef.get();

      if (prodSnap.exists) {
        const prodData = prodSnap.data();

        // Si el producto tiene variaciones, devolver a la variación específica
        if (prodData.hasVariations && Array.isArray(prodData.stockVariants)) {
          let variacionEncontrada = false;

          const newStockVariants = prodData.stockVariants.map((variant: any) => {
            let coincide = false;

            // Variaciones dinámicas (nuevo sistema)
            if (producto.selectedVariations && producto.variationAttributeIds) {
              coincide = producto.variationAttributeIds.every(
                (attrId: string) => variant.attributes?.[attrId] === producto.selectedVariations[attrId]
              );
            }
            // Variaciones legacy (talla/color)
            else if (producto.selectedTalla && producto.selectedColor) {
              coincide = variant.talla === producto.selectedTalla && variant.color === producto.selectedColor;
            }

            if (coincide) {
              variacionEncontrada = true;
              return {
                ...variant,
                cantidad: (variant.cantidad || 0) + producto.cantidad,
              };
            }

            return variant;
          });

          if (variacionEncontrada) {
            await prodRef.update({ stockVariants: newStockVariants });
          } else {
            const stockActual = prodData.stock || 0;
            const nuevoStock = stockActual + producto.cantidad;
            await prodRef.update({ stock: nuevoStock });
          }
        } else {
          const stockActual = prodData.stock || 0;
          const nuevoStock = stockActual + producto.cantidad;
          await prodRef.update({ stock: nuevoStock });
        }
      }
    }
  } catch (err) {
    console.error("Error devolviendo stock:", err);
    throw err;
  }
}
