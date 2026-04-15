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

  // Favicon fixo em /favicon.svg (monograma). Logo do MinIO é horizontal — ruim como ícone de aba.

  return <CrmBrandContext.Provider value={{ logoUrl }}>{children}</CrmBrandContext.Provider>;
}

export function useCrmBrand() {
  return useContext(CrmBrandContext);
}
