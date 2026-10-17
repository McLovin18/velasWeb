import { getStorage } from "firebase-admin/storage";
import admin from "./firebase-admin";

/**
 * Sube una imagen a Firebase Storage usando Admin SDK (sin autenticación de usuario requerida)
 * @param file Archivo de imagen a subir
 * @param path Ruta en Storage (ej: 'productos/nombre.jpg')
 * @returns URL pública de la imagen
 */
export async function uploadImageAndGetUrlAdmin(file: File, path: string): Promise<string> {
  const storage = getStorage(admin.app());
  const bucket = storage.bucket();

  // Convertir File a Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Subir el archivo
  const fileRef = bucket.file(path);
  await fileRef.save(buffer, {
    contentType: file.type,
  });

  // Obtener la URL pública
  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 año
  });

  return url;
}
