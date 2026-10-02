import React from 'react';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="ob-root">
      <div className="ob-image-pane">
        <picture>
          <source srcSet="/onboardingImage.webp" type="image/webp" />
          <img
            className="ob-background-image"
            src="/onboardingImage.jpg"
            alt=""
            width={640}
            height={640}
            draggable={false}
          />
        </picture>
        <div className="ob-branding">
          <img src="/logo.png" alt="" className="ob-branding-logo" width={32} height={32} />
          <div className="ob-branding-divider" />
          <span className="ob-branding-text">OJEE Tracker</span>
        </div>
      </div>
      <div className="ob-form-pane">
        <div className="ob-form-inner">{children}</div>
      </div>
    </div>
  );
}
