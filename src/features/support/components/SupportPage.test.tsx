import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SupportPage } from './SupportPage';
import { SUPPORT_FONTS_LINK_ID } from '../utils/loadSupportFonts';

const setSupportOverrideMock = vi.fn();

vi.mock('../../../core/context/ThemeContext', () => ({
  useTheme: () => ({
    setSupportOverride: setSupportOverrideMock,
  }),
}));

vi.mock('../../../core/context/RemoteAuthContext', () => ({
  useRemoteAuth: () => ({
    user: null,
  }),
}));

vi.mock('../../../core/context/UserProgressContext', () => ({
  useUserProgress: () => ({
    progressCardSettings: { userName: 'Test Aspirant' },
  }),
}));

describe('SupportPage Component', () => {
  beforeEach(() => {
    setSupportOverrideMock.mockClear();
    const existing = document.getElementById(SUPPORT_FONTS_LINK_ID);
    if (existing) existing.remove();
  });

  it('renders the Support page and dynamically loads handwriting fonts on mount', () => {
    expect(document.getElementById(SUPPORT_FONTS_LINK_ID)).toBeNull();

    render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>
    );

    // Font link should now be in the document
    const fontLink = document.getElementById(SUPPORT_FONTS_LINK_ID) as HTMLLinkElement;
    expect(fontLink).not.toBeNull();
    expect(fontLink.rel).toBe('stylesheet');
    expect(fontLink.href).toContain('Betania+Patmos+In');
    expect(fontLink.href).toContain('Cookie');

    // Key elements rendered
    expect(
      screen.getByRole('heading', { level: 1, name: /hi, fellow aspirant\./i })
    ).toBeInTheDocument();
    expect(setSupportOverrideMock).toHaveBeenCalledWith(true);
  });

  it('cleans up support override on unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <SupportPage />
      </MemoryRouter>
    );

    unmount();
    expect(setSupportOverrideMock).toHaveBeenCalledWith(false);
  });
});
