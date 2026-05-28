import type { BusinessPageMap, CmsBusinessUnit } from "./business";

export type ProjectStatus = "planificacion" | "en_progreso" | "finalizado";

export type LeadStatus = "nuevo" | "contactado" | "seguimiento" | "cerrado";
export type CmsUserRole = "admin" | "architect" | "site_manager" | "sales";

export type ServiceBeforeAfterItem = {
  id: string;
  title: string;
  beforeImage: string;
  afterImage: string;
};

export type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  text: string;
  description: string;
  heroImage: string;
  gallery: string[];
  priceLabel?: string;
  isPriceVisible: boolean;
  requiresLocation: boolean;
  leadPrompt: string;
  beforeAfterItems: ServiceBeforeAfterItem[];
};

export type ProcessStep = {
  id: string;
  order: string;
  title: string;
  text: string;
};

export type DetailMetric = {
  label: string;
  value: string;
};

export type ProgressUpdate = {
  id: string;
  title: string;
  date: string;
  summary: string;
  performedBy?: string;
  photos: string[];
  isDeleted?: boolean;
};

export type BranchOffice = {
  id: string;
  name: string;
  address: string;
  phone: string;
};

export type ContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  branches: BranchOffice[];
};

export type SiteSettings = {
  id?: string;
  companyName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  tagline: string;
  location: string;
  contact: ContactInfo;
  processSteps: ProcessStep[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
};

export type WorkProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: ProjectStatus;
  clientName: string;
  ownerName: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  planFiles: string[];
  brochureFile?: string;
  metrics: DetailMetric[];
  updates: ProgressUpdate[];
  mapEmbedUrl?: string;
};

export type BuildingUnit = {
  id: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  floorLabel: string;
  price?: string;
  isAvailable: boolean;
};

export type BuildingProject = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: ProjectStatus;
  clientName: string;
  ownerName: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  planFiles: string[];
  brochureFile?: string;
  metrics: DetailMetric[];
  amenities: string[];
  units: BuildingUnit[];
  mapEmbedUrl?: string;
};

export type PropertyStatus = "disponible" | "reservado" | "vendido" | "alquilado";
export type PropertyOperation = "venta" | "alquiler";

export type RealEstateProperty = {
  id: string;
  slug: string;
  title: string;
  category: string;
  operation: PropertyOperation;
  status: PropertyStatus;
  location: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  features: string[];
  mapEmbedUrl?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  company?: string;
  quote: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type LeadPayload = {
  fullName: string;
  nationalId: string;
  phone: string;
  email?: string;
  message: string;
  businessUnit: CmsBusinessUnit;
  interestType: "obra" | "edificio" | "departamento" | "general" | "servicio";
  referenceSlug?: string;
  referenceLabel?: string;
  unitLabel?: string;
  locationText?: string;
  locationLat?: number;
  locationLng?: number;
};

export type SiteContent = {
  settings: SiteSettings;
  services: ServiceItem[];
  works: WorkProject[];
  buildings: BuildingProject[];
  properties: RealEstateProperty[];
  team: TeamMember[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  businessPages: BusinessPageMap;
};
