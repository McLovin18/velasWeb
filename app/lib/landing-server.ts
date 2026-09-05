import { db } from "./firebase-admin";
import type { LandingSection } from "./landing-types";

type PublishedLanding = {
  id: string;
  hero?: Record<string, unknown> | null;
  sections: LandingSection[];
  featuredProducts?: string[];
  categories?: unknown[];
  benefits?: unknown[];
  testimonials?: unknown[];
  brands?: unknown[];
};

function serializeValue(value: unknown): unknown {
  if (value && typeof value === "object") {
    const candidate = value as { toDate?: () => Date; seconds?: number; nanoseconds?: number };
    if (typeof candidate.toDate === "function") return candidate.toDate().toISOString();
    if (typeof candidate.seconds === "number" && typeof candidate.nanoseconds === "number") {
      return new Date(candidate.seconds * 1000).toISOString();
    }
    if (Array.isArray(value)) return value.map(serializeValue);
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeValue(item)])
    );
  }
  return value;
}

export async function getPublishedLandingServer(): Promise<PublishedLanding | null> {
  try {
    const landingRef = db.collection("landingPage").doc("main");
    const [landingSnap, sectionsSnap] = await Promise.all([
      landingRef.get(),
      landingRef.collection("sectionsPublished").get(),
    ]);

    if (!landingSnap.exists) return null;

    const base = landingSnap.exists ? landingSnap.data() || {} : {};
    const hero = (base.heroPublished || base.hero || null) as Record<string, unknown> | null;
    const sections = sectionsSnap.empty
      ? ((base.sections || []) as LandingSection[])
      : sectionsSnap.docs.map((section) => ({
          id: section.id,
          ...section.data(),
        })) as LandingSection[];

    return serializeValue({
      id: "main",
      hero,
      sections,
      featuredProducts: base.featuredProductsPublished || base.featuredProducts || [],
      categories: base.categories || [],
      benefits: base.benefits || [],
      testimonials: base.testimonials || [],
      brands: base.brands || [],
    }) as PublishedLanding;
  } catch (error) {
    console.error("Error obteniendo landing publicada en servidor:", error);
    return null;
  }
}
