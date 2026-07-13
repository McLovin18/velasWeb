"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import type {
  LandingSectionStyles,
  LandingFieldStyle,
} from "../../lib/landing-types";
import ProductoCard from "../../components/ProductoCard";

export type FeaturedProductsSectionProps = {
  title?: string;
  products?: any[];
  styles?: LandingSectionStyles;
  fieldStyles?: Record<string, LandingFieldStyle>;
  device?: "mobile" | "desktop";
};

const MAX_PRODUCTS = 10;

// Extrae la fecha de creación de un producto en milisegundos,
// soportando Firestore Timestamp, Date, string ISO o number.
function getCreatedAtMillis(prod: any): number {
  const raw = prod?.createdAt ?? prod?.fechaCreacion ?? prod?.created_at ?? prod?.creadoEn;

  if (!raw) return 0;

  // Firestore Timestamp (tiene .seconds) o { _seconds }
  if (typeof raw === "object") {
    if (typeof raw.toMillis === "function") return raw.toMillis();
    if (typeof raw.seconds === "number") return raw.seconds * 1000;
    if (typeof raw._seconds === "number") return raw._seconds * 1000;
  }

  // Date, string ISO o number (epoch)
  const parsed = new Date(raw).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function FeaturedProductsSection({
  title = "Productos recientes",
  products = [],
  styles,
  fieldStyles,
}: FeaturedProductsSectionProps) {
  const paddingTop = styles?.paddingTop || (typeof window !== "undefined" && window.innerWidth < 768 ? "0.5rem" : "2rem");
  const paddingBottom = styles?.paddingBottom || (typeof window !== "undefined" && window.innerWidth < 768 ? "0.5rem" : "0.5rem");

  // Filtra productos válidos, ordena por fecha de creación (más nuevo primero) y limita a 8
  const recentProducts = products
    .filter((prod: any) => prod && prod.id)
    .sort((a: any, b: any) => getCreatedAtMillis(b) - getCreatedAtMillis(a))
    .slice(0, MAX_PRODUCTS);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Revisa si hay contenido para scrollear hacia cada lado
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, recentProducts.length]);

  const scrollByDirection = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.85;
    el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  // ── Return condicional DESPUÉS de todos los hooks ──
  if (!recentProducts.length) return null;

  return (
    <section
      style={{ paddingTop, paddingBottom }}
      className="w-full max-w-full px-2 md:px-2 flex flex-col items-center m-0 overflow-x-hidden"
    >
      {/* Título */}
      {title && (
        <h2
          className="section-title text-center py-2"
          style={fieldStyles?.title || { color: "var(--text)" }}
        >
          {title}
        </h2>
      )}

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-6 md:px-12 relative">
        {/* Flecha izquierda */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByDirection("left")}
            aria-label="Anterior"
            className="
              hidden sm:flex
              absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4
              z-20 h-10 w-10 rounded-full items-center justify-center
              shadow-lg border transition-all duration-200
              hover:scale-110 active:scale-95
            "
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 20 }}>chevron_left</span>
          </button>
        )}

        {/* Flecha derecha */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByDirection("right")}
            aria-label="Siguiente"
            className="
              hidden sm:flex
              absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4
              z-20 h-10 w-10 rounded-full items-center justify-center
              shadow-lg border transition-all duration-200
              hover:scale-110 active:scale-95
            "
            style={{
              background: "var(--card)",
              borderColor: "var(--border)",
              color: "var(--text)",
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 20 }}>chevron_right</span>
          </button>
        )}

        {/* ── Fila de productos con scroll horizontal ── */}
        <div
          ref={scrollRef}
          className="flex w-full gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
        >
          {recentProducts.map((prod: any, idx: number) => (
            <div
              key={prod.id}
              className="
                snap-start shrink-0
                w-[46%] xs:w-[42%] sm:w-[31%] md:w-[23%] lg:w-[19%]
                transition-all duration-300 flex flex-col items-stretch justify-stretch h-full
              "
              style={{ minWidth: 0 }}
            >
              <ProductoCard producto={prod} index={idx} />
            </div>
          ))}
        </div>
      </div>

      {/* Oculta la scrollbar visualmente mientras se mantiene el scroll funcional (touch/drag/wheel) */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}