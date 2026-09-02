/**
 * 🎯 ANALYTICS HOOK
 * Use this hook in components to track page views and clicks
 */

"use client";

import { useEffect } from "react";
import { trackPageView, trackClick } from "../lib/analytics-db";
import { isWebViewOrLowPerformance } from "../lib/webview-detect";

/**
 * Hook to track page views on component mount
 * Optimized for WebViews with debouncing
 */
export function useTrackPageView() {
  useEffect(() => {
    // En WebViews o dispositivos de bajo rendimiento, solo trackear si no se ha hecho recientemente
    if (isWebViewOrLowPerformance()) {
      const lastTrack = sessionStorage.getItem('lastPageTrack');
      const now = Date.now();
      const TRACK_INTERVAL = 10000; // 10 segundos entre tracks en WebView
      
      if (lastTrack && now - parseInt(lastTrack) < TRACK_INTERVAL) {
        console.log("[Analytics] Skipping track due to WebView rate limiting");
        return;
      }
      
      sessionStorage.setItem('lastPageTrack', now.toString());
    }
    
    // Track page view when component mounts
    trackPageView().catch(console.error);
  }, []);
}

/**
 * Hook to get tracking functions
 */
export function useTracking() {
  return {
    trackProductClick: () => trackClick("productClick"),
    trackCategoryClick: () => trackClick("categoryClick"),
    trackButtonClick: () => trackClick("buttonClick"),
    trackLinkClick: () => trackClick("linkClick"),
    trackBlogClick: () => trackClick("blogClick"),
  };
}
