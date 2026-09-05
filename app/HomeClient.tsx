"use client";

import { useEffect, useMemo, useState } from "react";

import BottomBarPublic from "./components/BottomBarPublic";
import WhatsAppFloatingButton from "./components/WhatsAppFloatingButton";
import { SectionRenderer } from "./landing/sectionRegistry";
import { getLandingPage } from "./lib/landing-db";
import { obtenerProductos } from "./lib/productos-db";
import type { LandingSection } from "./lib/landing-types";
import { useUser } from "./context/UserContext";
import FaqSection from "./components/FaqSection";

export type InitialLanding = {
  hero?: Record<string, unknown> | null;
  sections?: LandingSection[];
  featuredProducts?: string[];
};

export default function HomeClient({ initialLanding }: { initialLanding?: InitialLanding | null }) {
  const { isLogged } = useUser();
  const [landing, setLanding] = useState<InitialLanding | null>(initialLanding || null);
  const [featuredProductsResolved, setFeaturedProductsResolved] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialLanding);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        if (!initialLanding) {
          const data = await getLandingPage();
          if (mounted) {
            setLanding(data);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }

        const products = await obtenerProductos();
        const recentProducts = (products || [])
          .filter((product: any) => product?.id)
          .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
          .slice(0, 10);

        if (mounted) setFeaturedProductsResolved(recentProducts);
      } catch (error) {
        console.error("Error cargando contenido de la landing:", error);
        if (mounted) {
          setFeaturedProductsResolved([]);
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      mounted = false;
    };
  }, [initialLanding]);

  const landingSections = useMemo(() => {
    const sections = landing?.sections ?? [];
    const heroSection = landing?.hero
      ? [{ id: "landing-hero", type: "hero", props: landing.hero, order: -1, hidden: false } as LandingSection]
      : [];

    return [...heroSection, ...sections]
      .filter((section) => !section.hidden)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [landing]);

  const renderedSections = useMemo(() => {
    const featuredCategoryItemsFromProducts = featuredProductsResolved
      .map((product: any) => {
        const categoryId = String(product?.categoria || "").trim();
        if (!categoryId) return null;
        return {
          id: categoryId,
          title: categoryId,
          image: product?.imagenes?.[0] || product?.imagen || null,
          link: `/products-by-category?cat=${encodeURIComponent(categoryId)}`,
        };
      })
      .filter(Boolean)
      .filter((item: any, index: number, array: any[]) =>
        array.findIndex((candidate: any) => candidate.id === item.id) === index
      );

    return landingSections.map((section) => {
      if (section.type === "featuredProducts") {
        return {
          ...section,
          props: { ...(section.props || {}), products: featuredProductsResolved },
        } as LandingSection;
      }

      if (section.type === "featuredCategories") {
        const existingItems = Array.isArray((section.props as any)?.items)
          ? (section.props as any).items
          : [];
        return {
          ...section,
          props: {
            ...(section.props || {}),
            items: existingItems.length > 0 ? existingItems : featuredCategoryItemsFromProducts,
          },
        } as LandingSection;
      }

      return section;
    });
  }, [landingSections, featuredProductsResolved]);

  const lastHeroIndex = useMemo(() => {
    let last = -1;
    landingSections.forEach((section, index) => {
      if (section.type === "hero") last = index;
    });
    return last;
  }, [landingSections]);

  return (
    <>
      <WhatsAppFloatingButton />
      <main className="min-h-screen w-full" style={{ background: "var(--bg)", color: "var(--text)" }}>
        {loading ? (
          <div
            className="w-full relative overflow-hidden"
            style={{ aspectRatio: "2400 / 1000", minHeight: "300px", background: "var(--bgSecondary)" }}
          />
        ) : renderedSections.length > 0 ? (
          <div className="flex flex-col">
            {renderedSections.map((section, index) => (
              <SectionRenderer
                key={section.id}
                section={section}
                isLastHero={section.type === "hero" && index === lastHeroIndex}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-slate-500">
            No hay secciones publicadas para mostrar.
          </div>
        )}
        {!loading && <FaqSection />}
      </main>
      {!isLogged && <BottomBarPublic />}
    </>
  );
}
