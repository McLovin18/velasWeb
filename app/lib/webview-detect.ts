/**
 * 🔍 WEBVIEW DETECTION
 * Detecta si el usuario está en un WebView (Instagram, Facebook, etc.)
 * Los WebViews tienen limitaciones severas de memoria y rendimiento
 */

export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Detectar WebView de Instagram
  if (userAgent.includes('Instagram')) return true;
  
  // Detectar WebView de Facebook
  if (userAgent.includes('FBAN') || userAgent.includes('FBAV')) return true;
  
  // Detectar WebView de TikTok
  if (userAgent.includes('TikTok')) return true;
  
  // Detectar WebView de Twitter
  if (userAgent.includes('Twitter')) return true;
  
  // Detectar WebView genérico (wv en user agent)
  if (userAgent.includes('wv')) return true;
  
  // Detectar LinkedIn WebView
  if (userAgent.includes('LinkedIn')) return true;
  
  return false;
}

export function isWebViewOrLowPerformance(): boolean {
  if (isWebView()) return true;
  
  // También considerar dispositivos de bajo rendimiento
  if (typeof navigator !== 'undefined' && (navigator as any).hardwareConcurrency) {
    const cores = (navigator as any).hardwareConcurrency;
    if (cores <= 2) return true; // 2 o menos cores = bajo rendimiento
  }
  
  return false;
}
