import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

const COLLECTION = "cuentas-bancarias";

export type CuentaBancaria = {
  id?: string;
  banco: string;
  tipo: string; // "ahorros", "corriente", etc.
  numeroCuenta: string;
  titular: string;
  cedulaRuc: string;
  activa: boolean;
  createdAt?: number;
  fechaCreacion?: any;
};

export async function obtenerCuentasBancarias(): Promise<CuentaBancaria[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  );
  return snapshot.docs
    .map((d) => ({ id: d.id, ...(d.data() as any) }))
    .filter((c) => c.activa !== false);
}

export async function crearCuentaBancaria(
  cuenta: Omit<CuentaBancaria, "id" | "createdAt" | "fechaCreacion">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...cuenta,
    activa: true,
    createdAt: Date.now(),
    fechaCreacion: serverTimestamp(),
  });
  return docRef.id;
}

export async function actualizarCuentaBancaria(
  id: string,
  data: Partial<CuentaBancaria>
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, data as any);
}

export async function eliminarCuentaBancaria(id: string): Promise<void> {
  // En lugar de eliminar, marcar como inactiva
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { activa: false });
}

export async function obtenerCuentaBancariaPorId(
  id: string
): Promise<CuentaBancaria | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as CuentaBancaria;
}
