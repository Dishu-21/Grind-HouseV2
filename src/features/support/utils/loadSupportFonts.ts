export const SUPPORT_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Betania+Patmos+In&family=Cookie&display=swap';

export const SUPPORT_FONTS_LINK_ID = 'support-fonts-stylesheet';

/**
 * Dynamically injects Google Fonts for Betania Patmos In and Cookie
 * only when requested (e.g. when mounting the Support page).
 * Idempotent: will not create duplicate <link> elements.
 */
export function loadSupportFonts(): void {
  if (typeof document === 'undefined') return;

  const existing =
    document.getElementById(SUPPORT_FONTS_LINK_ID) ||
    document.querySelector(`link[href="${SUPPORT_FONTS_HREF}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.id = SUPPORT_FONTS_LINK_ID;
  link.rel = 'stylesheet';
  link.href = SUPPORT_FONTS_HREF;
  document.head.appendChild(link);
}
