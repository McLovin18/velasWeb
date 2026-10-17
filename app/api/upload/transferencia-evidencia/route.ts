import { NextRequest, NextResponse } from "next/server";
import { uploadImageAndGetUrlAdmin } from "../../../lib/upload-image-admin";

export async function POST(req: NextRequest) {
  try {
    console.log("[upload-evidencia] Iniciando subida...");
    const formData = await req.formData();
    const file = formData.get("file") as File;

    console.log("[upload-evidencia] Archivo recibido:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      console.error("[upload-evidencia] No se proporcionó archivo");
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!file.type.startsWith("image/")) {
      console.error("[upload-evidencia] Archivo no es imagen:", file.type);
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error("[upload-evidencia] Archivo demasiado grande:", file.size);
      return NextResponse.json(
        { error: "El archivo no puede superar los 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileName = `evidencias-transferencia/${timestamp}-${random}.${file.name.split(".").pop()}`;

    console.log("[upload-evidencia] Subiendo a Firebase Storage:", fileName);

    // Subir a Firebase Storage usando Admin SDK
    const url = await uploadImageAndGetUrlAdmin(file, fileName);

    console.log("[upload-evidencia] Subida exitosa:", url);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("[upload-evidencia] Error completo:", error);
    console.error("[upload-evidencia] Error message:", error.message);
    console.error("[upload-evidencia] Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Error al subir la evidencia" },
      { status: 500 }
    );
  }
}
