export type ProjectStatus = "planificacion" | "en_progreso" | "finalizado";

export type LeadStatus = "nuevo" | "contactado" | "seguimiento" | "cerrado";

export type ServiceItem = {
  id: string;
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
};

export type ContactInfo = {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
};

export type SiteSettings = {
  companyName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  tagline: string;
  location: string;
  contact: ContactInfo;
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
  metrics: DetailMetric[];
  amenities: string[];
  units: BuildingUnit[];
  mapEmbedUrl?: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

export type LeadPayload = {
  fullName: string;
  phone: string;
  email: string;
  message: string;
  interestType: "obra" | "edificio" | "departamento" | "general";
  referenceSlug?: string;
  unitLabel?: string;
};

export type SiteContent = {
  settings: SiteSettings;
  services: ServiceItem[];
  works: WorkProject[];
  buildings: BuildingProject[];
  team: TeamMember[];
};
