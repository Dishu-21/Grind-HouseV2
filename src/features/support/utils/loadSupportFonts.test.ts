import { describe, it, expect, beforeEach } from 'vitest';
import { loadSupportFonts, SUPPORT_FONTS_HREF, SUPPORT_FONTS_LINK_ID } from './loadSupportFonts';

describe('loadSupportFonts', () => {
  beforeEach(() => {
    // Clean up any existing font links in document.head
    const links = document.querySelectorAll(
      `link[href*="Betania+Patmos+In"], #${SUPPORT_FONTS_LINK_ID}`
    );
    links.forEach((link) => link.remove());
  });

  it('injects Google Fonts link for Betania Patmos In and Cookie into document.head', () => {
    expect(document.getElementById(SUPPORT_FONTS_LINK_ID)).toBeNull();

    loadSupportFonts();

    const injectedLink = document.getElementById(SUPPORT_FONTS_LINK_ID) as HTMLLinkElement;
    expect(injectedLink).not.toBeNull();
    expect(injectedLink.rel).toBe('stylesheet');
    expect(injectedLink.href).toContain('family=Betania+Patmos+In');
    expect(injectedLink.href).toContain('family=Cookie');
    expect(injectedLink.href).toBe(SUPPORT_FONTS_HREF);
  });

  it('is idempotent and does not inject duplicate links on subsequent calls', () => {
    loadSupportFonts();
    loadSupportFonts();
    loadSupportFonts();

    const injectedLinks = document.querySelectorAll(`#${SUPPORT_FONTS_LINK_ID}`);
    expect(injectedLinks.length).toBe(1);
  });
});
