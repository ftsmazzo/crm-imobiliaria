'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { SITE_CONFIG } from '@/lib/config';
import type { SiteConfigPublic } from '@/lib/api';

export type SiteConfigContextValue = {
  logoUrl: string | null;
  heroImageUrl: string | null;
  nome: string;
  whatsapp: string;
  endereco: string;
  creci: string;
};

const defaultContext: SiteConfigContextValue = {
  logoUrl: null,
  heroImageUrl: null,
  nome: SITE_CONFIG.nome,
  whatsapp: SITE_CONFIG.whatsapp,
  endereco: SITE_CONFIG.endereco,
  creci: SITE_CONFIG.creci,
};

const SiteConfigContext = createContext<SiteConfigContextValue>(defaultContext);

function mergeConfig(api: SiteConfigPublic | null): SiteConfigContextValue {
  if (!api) return defaultContext;
  return {
    logoUrl: api.logoUrl ?? null,
    heroImageUrl: api.heroImageUrl ?? null,
    nome: api.nome?.trim() || SITE_CONFIG.nome,
    whatsapp: api.whatsapp?.trim() || SITE_CONFIG.whatsapp,
    endereco: api.endereco?.trim() || SITE_CONFIG.endereco,
    creci: api.creci?.trim() || SITE_CONFIG.creci,
  };
}

export function SiteConfigProvider({
  apiConfig,
  children,
}: {
  apiConfig: SiteConfigPublic | null;
  children: ReactNode;
}) {
  const value = mergeConfig(apiConfig);
  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
