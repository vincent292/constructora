import type { FaqItem, ProcessStep } from "./cms";

export type BusinessSlug = "constructora" | "juridico" | "bienes-raices";
export type CmsBusinessUnit = BusinessSlug | "grupo";

export type BusinessServiceItem = {
  id: string;
  title: string;
  text: string;
};

export type BusinessHighlightItem = {
  id: string;
  title: string;
  text: string;
};

export type GatewayArea = {
  slug: BusinessSlug;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  image: string;
  bullets: string[];
};

export type BusinessAreaContent = {
  slug: BusinessSlug;
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  image: string;
  tagline: string;
  coverage: string;
  coverageDescription: string;
  primaryLabel: string;
  secondaryLabel: string;
  services: BusinessServiceItem[];
  highlights: BusinessHighlightItem[];
  process: ProcessStep[];
  faqs: FaqItem[];
  contactPrompt: string;
  footerBlurb: string;
};

export type ManagedBusinessSlug = Exclude<BusinessSlug, "constructora">;
export type BusinessPageMap = Record<ManagedBusinessSlug, BusinessAreaContent>;
