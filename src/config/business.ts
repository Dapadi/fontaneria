/**
 * Fuente de verdad. Dejar vacíos los datos no aprobados; no usar ejemplos.
 * Índice: disabled hasta terminar la revisión; live permite publicar.
 */
export type Business = {
  mode: 'draft' | 'live'; name: string; locality: string; region: string; locale: string;
  domain: string; phone: string; whatsapp: string; email: string; hours: string;
  hoursStructured: { dayOfWeek: string[]; opens: string; closes: string }[];
  emergency: string; logo: string; address: string; sameAs: string[];
  confirmedServices: string[]; confirmedZones: string[];
  approvedImages: boolean; approvedCopy: boolean; trust: string[];
  legal: { notice: string; privacy: string; cookies: string };
  contactEndpoint: string; allowOaiSearch: boolean; googleProfile: string;
  reviews: { rating: number; count: number; entries: { author: string; date: string; text: string; url: string }[] } | null;
  projects: { title: string; category: string; town: string; problem: string; solution: string; image: string; alt: string; before?: string; after?: string }[];
};

export const business: Business = {
  mode: 'draft', name: 'Fontanería Alzira', locality: 'Alzira', region: 'Valencia', locale: 'es-ES',
  domain: '', phone: '', whatsapp: '', email: '', hours: '', hoursStructured: [],
  emergency: '', logo: '', address: '', sameAs: [], confirmedServices: [], confirmedZones: [],
  approvedImages: false, approvedCopy: false, trust: [],
  legal: { notice: '', privacy: '', cookies: '' },
  contactEndpoint: '', allowOaiSearch: false, googleProfile: '', reviews: null, projects: [],
};
