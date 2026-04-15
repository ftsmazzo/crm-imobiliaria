import { createContext, useContext, useEffect, useState } from 'react';
import { getPublicSiteConfig } from '../api';

type CrmBrandContextType = { logoUrl: string | null };

const CrmBrandContext = createContext<CrmBrandContextType>({ logoUrl: null });

export function CrmBrandProvider({ children }: { children: React.ReactNode }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    getPublicSiteConfig()
      .then((c) => setLogoUrl(c.logoUrl))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!logoUrl) return;
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = logoUrl;
    link.type = 'image/png';
  }, [logoUrl]);

  return <CrmBrandContext.Provider value={{ logoUrl }}>{children}</CrmBrandContext.Provider>;
}

export function useCrmBrand() {
  return useContext(CrmBrandContext);
}
