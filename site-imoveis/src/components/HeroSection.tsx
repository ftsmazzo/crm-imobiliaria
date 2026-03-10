'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

type Props = { children: React.ReactNode };

export default function HeroSection({ children }: Props) {
  const config = useSiteConfig();
  const style: React.CSSProperties | undefined = config.heroImageUrl
    ? {
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.75)), url(${config.heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <section className="hero-portal" style={style}>
      <div className="container">
        {children}
      </div>
    </section>
  );
}
