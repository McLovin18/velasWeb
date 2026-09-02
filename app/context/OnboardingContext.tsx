"use client";
import { createContext, useContext, useState } from "react";
import { isWebViewOrLowPerformance } from "../lib/webview-detect";

interface OnboardingContextType {
  showWelcomeGlobal: boolean;
  setShowWelcomeGlobal: (v: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  // Desactivar onboarding en WebViews para mejorar rendimiento
  const [showWelcomeGlobal, setShowWelcomeGlobal] = useState(
    typeof window !== 'undefined' ? !isWebViewOrLowPerformance() : false
  );
  return (
    <OnboardingContext.Provider value={{ showWelcomeGlobal, setShowWelcomeGlobal }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}

