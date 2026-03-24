'use client';

import { useSiteConfig } from '@/components/SiteConfigProvider';

type Props = { children: React.ReactNode };

export default function HeroSection({ children }: Props) {
  const config = useSiteConfig();
  const hasVideo = Boolean(config.heroVideoUrl);
  const style: React.CSSProperties | undefined =
    !hasVideo && config.heroImageUrl
      ? {
          backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.15)), url(${config.heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

  return (
    <section className="hero-portal" style={style}>
      {hasVideo && config.heroVideoUrl && (
        <>
          <video
            className="hero-portal-video"
            src={config.heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            poster={config.heroImageUrl ?? undefined}
          />
          <div className="hero-portal-video-overlay" aria-hidden />
        </>
      )}
      <div className="container">{children}</div>
    </section>
  );
}
