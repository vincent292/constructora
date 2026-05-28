import { fallbackContent } from "../data/fallback-content";
import type {
  BuildingProject,
  FaqItem,
  LeadPayload,
  RealEstateProperty,
  ServiceItem,
  SiteContent,
  SiteSettings,
  TeamMember,
  TestimonialItem,
  WorkProject,
} from "../types/cms";
import {
  assertEmail,
  sanitizeOptionalText,
  sanitizePhone,
  sanitizeSlug,
  sanitizeText,
} from "./security";
import { isSupabaseConfigured, supabaseInsert, supabaseSelect } from "./supabase";
import { defaultBusinessPages } from "../data/business-network";
import type { BusinessAreaContent, BusinessPageMap, ManagedBusinessSlug } from "../types/business";

type WorkRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: WorkProject["status"];
  client_name: string;
  owner_name: string;
  summary: string;
  description: string;
  hero_image: string;
  gallery: string[] | null;
  plan_files: string[] | null;
  brochure_file: string | null;
  metrics: WorkProject["metrics"] | null;
  map_embed_url: string | null;
  updates:
    | {
        id: string;
        title: string;
        date: string;
        summary: string;
        performed_by: string | null;
        photos: string[] | null;
        is_deleted: boolean | null;
      }[]
    | null;
};

type SettingsRow = {
  id?: string;
  company_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_accent: string;
  hero_description: string;
  hero_image: string;
  tagline: string;
  location: string;
  contact: SiteSettings["contact"] | null;
  process_steps: SiteSettings["processSteps"] | null;
  testimonials: SiteSettings["testimonials"] | null;
  faqs: SiteSettings["faqs"] | null;
};

type BuildingRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: BuildingProject["status"];
  client_name: string;
  owner_name: string;
  summary: string;
  description: string;
  hero_image: string;
  gallery: string[] | null;
  plan_files: string[] | null;
  brochure_file: string | null;
  metrics: BuildingProject["metrics"] | null;
  amenities: string[] | null;
  map_embed_url: string | null;
  units:
    | {
        id: string;
        title: string;
        bedrooms: number;
        bathrooms: number;
        area: string;
        floor_label: string;
        price: string | null;
        is_available: boolean;
      }[]
    | null;
};

type ServiceRow = {
  id: string;
  slug: string | null;
  title: string;
  text: string;
  description: string | null;
  hero_image: string | null;
  gallery: string[] | null;
  price_label: string | null;
  is_price_visible: boolean | null;
  requires_location: boolean | null;
  lead_prompt: string | null;
  before_after_items: ServiceItem["beforeAfterItems"] | null;
};

type BusinessAreaRow = {
  slug: ManagedBusinessSlug;
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  image: string;
  tagline: string;
  coverage: string;
  coverage_description: string;
  primary_label: string;
  secondary_label: string;
  services: BusinessAreaContent["services"] | null;
  highlights: BusinessAreaContent["highlights"] | null;
  process: BusinessAreaContent["process"] | null;
  faqs: BusinessAreaContent["faqs"] | null;
  contact_prompt: string;
  footer_blurb: string;
};

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  operation: RealEstateProperty["operation"];
  status: RealEstateProperty["status"];
  location: string;
  price: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  summary: string;
  description: string;
  hero_image: string;
  gallery: string[] | null;
  features: string[] | null;
  map_embed_url: string | null;
};

function normalizeServiceSlug(row: Pick<ServiceRow, "slug" | "title" | "id">) {
  if (row.slug?.trim()) {
    return row.slug.trim();
  }

  return sanitizeSlug(`${row.title}-${row.id.slice(0, 8)}`);
}

function mapService(row: ServiceRow): ServiceItem {
  return {
    id: row.id,
    slug: normalizeServiceSlug(row),
    title: row.title,
    text: row.text,
    description: row.description?.trim() || row.text,
    heroImage: row.hero_image?.trim() || "",
    gallery: row.gallery ?? [],
    priceLabel: row.price_label?.trim() || undefined,
    isPriceVisible: row.is_price_visible ?? false,
    requiresLocation: row.requires_location ?? false,
    leadPrompt: row.lead_prompt?.trim() || "",
    beforeAfterItems: row.before_after_items ?? [],
  };
}

function normalizeSettings(row?: SettingsRow): SiteSettings {
  const fallbackBranches = fallbackContent.settings.contact.branches;
  const nextContact = row?.contact ?? fallbackContent.settings.contact;

  return {
    ...fallbackContent.settings,
    id: row?.id ?? fallbackContent.settings.id,
    companyName: row?.company_name ?? fallbackContent.settings.companyName,
    heroEyebrow: row?.hero_eyebrow ?? fallbackContent.settings.heroEyebrow,
    heroTitle: row?.hero_title ?? fallbackContent.settings.heroTitle,
    heroAccent: row?.hero_accent ?? fallbackContent.settings.heroAccent,
    heroDescription:
      row?.hero_description ?? fallbackContent.settings.heroDescription,
    heroImage: row?.hero_image ?? fallbackContent.settings.heroImage,
    tagline: row?.tagline ?? fallbackContent.settings.tagline,
    location: row?.location ?? fallbackContent.settings.location,
    contact: {
      ...fallbackContent.settings.contact,
      ...nextContact,
      branches:
        nextContact?.branches && nextContact.branches.length > 0
          ? nextContact.branches
          : fallbackBranches,
    },
    processSteps:
      row?.process_steps && row.process_steps.length > 0
        ? row.process_steps
        : fallbackContent.settings.processSteps,
    testimonials:
      row?.testimonials && row.testimonials.length > 0
        ? row.testimonials
        : fallbackContent.testimonials,
    faqs:
      row?.faqs && row.faqs.length > 0
        ? row.faqs
        : fallbackContent.faqs,
  };
}

function mapWork(row: WorkRow): WorkProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    location: row.location,
    year: row.year,
    area: row.area,
    status: row.status,
    clientName: row.client_name,
    ownerName: row.owner_name,
    summary: row.summary,
    description: row.description,
    heroImage: row.hero_image,
    gallery: row.gallery ?? [],
    planFiles: row.plan_files ?? [],
    brochureFile: row.brochure_file ?? undefined,
    metrics: row.metrics ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
    updates:
      row.updates?.map((update) => ({
        id: update.id,
        title: update.title,
        date: update.date,
        summary: update.summary,
        performedBy: update.performed_by ?? undefined,
        photos: update.photos ?? [],
        isDeleted: update.is_deleted ?? false,
      })).filter((update) => !update.isDeleted) ?? [],
  };
}

function mapBuilding(row: BuildingRow): BuildingProject {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    location: row.location,
    year: row.year,
    area: row.area,
    status: row.status,
    clientName: row.client_name,
    ownerName: row.owner_name,
    summary: row.summary,
    description: row.description,
    heroImage: row.hero_image,
    gallery: row.gallery ?? [],
    planFiles: row.plan_files ?? [],
    brochureFile: row.brochure_file ?? undefined,
    metrics: row.metrics ?? [],
    amenities: row.amenities ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
    units:
      row.units?.map((unit) => ({
        id: unit.id,
        title: unit.title,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        area: unit.area,
        floorLabel: unit.floor_label,
        price: unit.price ?? undefined,
        isAvailable: unit.is_available,
      })) ?? [],
  };
}

function mapBusinessArea(row: BusinessAreaRow): BusinessAreaContent {
  const fallback = defaultBusinessPages[row.slug];

  return {
    slug: row.slug,
    label: row.label || fallback.label,
    eyebrow: row.eyebrow || fallback.eyebrow,
    title: row.title || fallback.title,
    accent: row.accent || fallback.accent,
    description: row.description || fallback.description,
    image: row.image || fallback.image,
    tagline: row.tagline || fallback.tagline,
    coverage: row.coverage || fallback.coverage,
    coverageDescription: row.coverage_description || fallback.coverageDescription,
    primaryLabel: row.primary_label || fallback.primaryLabel,
    secondaryLabel: row.secondary_label || fallback.secondaryLabel,
    services: row.services?.length ? row.services : fallback.services,
    highlights: row.highlights?.length ? row.highlights : fallback.highlights,
    process: row.process?.length ? row.process : fallback.process,
    faqs: row.faqs?.length ? row.faqs : fallback.faqs,
    contactPrompt: row.contact_prompt || fallback.contactPrompt,
    footerBlurb: row.footer_blurb || fallback.footerBlurb,
  };
}

function mapProperty(row: PropertyRow): RealEstateProperty {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    operation: row.operation,
    status: row.status,
    location: row.location,
    price: row.price,
    area: row.area,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    summary: row.summary,
    description: row.description,
    heroImage: row.hero_image,
    gallery: row.gallery ?? [],
    features: row.features ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
  };
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) {
    return fallbackContent;
  }

  try {
    const [settingsRows, services, works, buildings, team, businessAreaRows, properties] = await Promise.all([
      supabaseSelect<SettingsRow[]>("site_settings", {
        select: "*",
        limit: 1,
      }),
      supabaseSelect<ServiceRow[]>("services", {
        select:
          "id,slug,title,text,description,hero_image,gallery,price_label,is_price_visible,requires_location,lead_prompt,before_after_items",
        order: "display_order.asc",
      }),
      supabaseSelect<WorkRow[]>("works", {
        select:
          "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,brochure_file,metrics,map_embed_url,updates:work_updates(id,title,date,summary,performed_by,photos,is_deleted)",
        order: "created_at.desc",
      }),
      supabaseSelect<BuildingRow[]>("buildings", {
        select:
          "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,brochure_file,metrics,amenities,map_embed_url,units:building_units(id,title,bedrooms,bathrooms,area,floor_label,price,is_available)",
        order: "created_at.desc",
      }),
      supabaseSelect<TeamMember[]>("team_members", {
        select: "id,name,role,bio,image",
        order: "display_order.asc",
      }),
      supabaseSelect<BusinessAreaRow[]>("business_area_pages", {
        select:
          "slug,label,eyebrow,title,accent,description,image,tagline,coverage,coverage_description,primary_label,secondary_label,services,highlights,process,faqs,contact_prompt,footer_blurb",
      }),
      supabaseSelect<PropertyRow[]>("real_estate_properties", {
        select:
          "id,slug,title,category,operation,status,location,price,area,bedrooms,bathrooms,summary,description,hero_image,gallery,features,map_embed_url",
        order: "created_at.desc",
      }),
    ]);

    const normalizedSettings = normalizeSettings(settingsRows[0]);
    const businessPages: BusinessPageMap = { ...defaultBusinessPages };

    for (const row of businessAreaRows) {
      businessPages[row.slug] = mapBusinessArea(row);
    }

    return {
      settings: normalizedSettings,
      services: services.length ? services.map((row) => mapService(row as ServiceRow)) : fallbackContent.services,
      works: works.length ? works.map(mapWork) : fallbackContent.works,
      buildings: buildings.length
        ? buildings.map(mapBuilding)
        : fallbackContent.buildings,
      properties: properties.length ? properties.map(mapProperty) : fallbackContent.properties,
      team: team.length ? team : fallbackContent.team,
      testimonials: normalizedSettings.testimonials as TestimonialItem[],
      faqs: normalizedSettings.faqs as FaqItem[],
      businessPages,
    };
  } catch (error) {
    console.warn("No se pudo cargar Supabase. Se usa contenido local.", error);
    return fallbackContent;
  }
}

export async function createLead(payload: LeadPayload) {
  if (!isSupabaseConfigured) {
    return { ok: true, stored: "local-only" };
  }

  const emailValue = payload.email?.trim() ? assertEmail(payload.email) : null;
  const locationLat =
    payload.locationLat === undefined
      ? null
      : Number.isFinite(payload.locationLat) && payload.locationLat >= -90 && payload.locationLat <= 90
        ? payload.locationLat
        : (() => {
            throw new Error("La latitud enviada no es valida.");
          })();
  const locationLng =
    payload.locationLng === undefined
      ? null
      : Number.isFinite(payload.locationLng) && payload.locationLng >= -180 && payload.locationLng <= 180
        ? payload.locationLng
        : (() => {
            throw new Error("La longitud enviada no es valida.");
          })();

  await supabaseInsert(
    "leads",
    {
      full_name: sanitizeText(payload.fullName, "El nombre", { min: 3, max: 120 }),
      national_id: sanitizeText(payload.nationalId, "El carnet", { min: 5, max: 40 }),
      phone: sanitizePhone(payload.phone),
      email: emailValue,
      message: sanitizeText(payload.message, "El mensaje", {
        min: 10,
        max: 2000,
        preserveNewlines: true,
      }),
      business_unit: payload.businessUnit,
      interest_type: payload.interestType,
      reference_slug: payload.referenceSlug ? sanitizeSlug(payload.referenceSlug) : null,
      reference_label: payload.referenceLabel
        ? sanitizeOptionalText(payload.referenceLabel, "La referencia", 160)
        : null,
      unit_label: payload.unitLabel
        ? sanitizeOptionalText(payload.unitLabel, "La unidad", 120)
        : null,
      location_text: payload.locationText
        ? sanitizeOptionalText(payload.locationText, "La ubicacion", 240)
        : null,
      location_lat: locationLat,
      location_lng: locationLng,
      status: "nuevo",
    },
    { prefer: "return=minimal" }
  );

  return { ok: true, stored: "supabase" };
}
