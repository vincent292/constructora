import { fallbackContent } from "../data/fallback-content";
import type {
  BuildingProject,
  LeadPayload,
  ServiceItem,
  SiteContent,
  SiteSettings,
  TeamMember,
  WorkProject,
} from "../types/cms";
import { isSupabaseConfigured, supabaseInsert, supabaseSelect } from "./supabase";

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

export async function loadSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured) {
    return fallbackContent;
  }

  try {
    const [settingsRows, services, works, buildings, team] = await Promise.all([
      supabaseSelect<SettingsRow[]>("site_settings", {
        select: "*",
        limit: 1,
      }),
      supabaseSelect<ServiceItem[]>("services", {
        select: "id,title,text",
        order: "display_order.asc",
      }),
      supabaseSelect<WorkRow[]>("works", {
        select:
          "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,metrics,map_embed_url,updates:work_updates(id,title,date,summary,performed_by,photos,is_deleted)",
        order: "created_at.desc",
      }),
      supabaseSelect<BuildingRow[]>("buildings", {
        select:
          "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,metrics,amenities,map_embed_url,units:building_units(id,title,bedrooms,bathrooms,area,floor_label,price,is_available)",
        order: "created_at.desc",
      }),
      supabaseSelect<TeamMember[]>("team_members", {
        select: "id,name,role,bio,image",
        order: "display_order.asc",
      }),
    ]);

    return {
      settings: normalizeSettings(settingsRows[0]),
      services: services.length ? services : fallbackContent.services,
      works: works.length ? works.map(mapWork) : fallbackContent.works,
      buildings: buildings.length
        ? buildings.map(mapBuilding)
        : fallbackContent.buildings,
      team: team.length ? team : fallbackContent.team,
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

  await supabaseInsert(
    "leads",
    {
      full_name: payload.fullName,
      phone: payload.phone,
      email: payload.email,
      message: payload.message,
      interest_type: payload.interestType,
      reference_slug: payload.referenceSlug ?? null,
      unit_label: payload.unitLabel ?? null,
      status: "nuevo",
    },
    { prefer: "return=minimal" }
  );

  return { ok: true, stored: "supabase" };
}
