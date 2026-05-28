import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type {
  BuildingProject,
  BuildingUnit,
  CmsUserRole,
  LeadStatus,
  ProgressUpdate,
  ProjectStatus,
  RealEstateProperty,
  ServiceBeforeAfterItem,
  ServiceItem,
  SiteSettings,
  TeamMember,
  WorkProject,
} from "../types/cms";
import type {
  BusinessAreaContent,
  BusinessPageMap,
  CmsBusinessUnit,
  ManagedBusinessSlug,
} from "../types/business";
import { fallbackContent } from "../data/fallback-content";
import {
  assertEmail,
  assertPassword,
  sanitizeHttpUrl,
  sanitizePhone,
  sanitizeSlug,
  sanitizeStringList,
  sanitizeText,
  sanitizeUrlList,
} from "./security";
import { isSupabaseConfigured, supabaseClient } from "./supabase";

export type LeadRecord = {
  id: string;
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
  status: LeadStatus;
  adminNotes?: string;
  createdAt: string;
};

export type CmsViewerProfile = {
  userId?: string;
  fullName: string;
  role: CmsUserRole;
  businessUnit: CmsBusinessUnit;
  email?: string;
};

export type CmsStaffProfile = {
  userId: string;
  fullName: string;
  email?: string;
  role: CmsUserRole;
  businessUnit: CmsBusinessUnit;
  assignedWorkIds: string[];
  assignedBuildingIds: string[];
};

type WorkRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: ProjectStatus;
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
      }[]
    | null;
};

type BuildingRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  status: ProjectStatus;
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

type TeamRow = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  display_order?: number;
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
  before_after_items: ServiceBeforeAfterItem[] | null;
  display_order?: number;
};

type LeadRow = {
  id: string;
  full_name: string;
  national_id: string | null;
  phone: string;
  email: string | null;
  message: string;
  business_unit: CmsBusinessUnit | null;
  interest_type: LeadRecord["interestType"];
  reference_slug: string | null;
  reference_label: string | null;
  unit_label: string | null;
  location_text: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: LeadStatus;
  admin_notes: string | null;
  created_at: string;
};

type AdminProfileRow = {
  user_id?: string;
  full_name: string | null;
  email: string | null;
  role: CmsUserRole | null;
  business_unit: CmsBusinessUnit | null;
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

type SiteSettingsRow = {
  id: string;
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

type WorkAssignmentRow = {
  work_id: string;
  user_id: string;
};

type BuildingAssignmentRow = {
  building_id: string;
  user_id: string;
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

export type CmsDashboardData = {
  settings: SiteSettings;
  services: ServiceItem[];
  works: WorkProject[];
  buildings: BuildingProject[];
  properties: RealEstateProperty[];
  team: TeamMember[];
  leads: LeadRecord[];
  businessPages: BusinessPageMap;
  viewer: CmsViewerProfile;
  staff: CmsStaffProfile[];
};

function getClient() {
  if (!isSupabaseConfigured || !supabaseClient) {
    throw new Error("Supabase no esta configurado.");
  }

  return supabaseClient;
}

export const isCmsSignupEnabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CMS_SIGNUP === "true";

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
    updates:
      row.updates?.map((update) => ({
        id: update.id,
        title: update.title,
        date: update.date,
        summary: update.summary,
        performedBy: update.performed_by ?? undefined,
        photos: update.photos ?? [],
      })) ?? [],
    mapEmbedUrl: row.map_embed_url ?? undefined,
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

function mapTeam(row: TeamRow): TeamMember {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    bio: row.bio,
    image: row.image,
  };
}

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

function mapLead(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    nationalId: row.national_id ?? "Pendiente",
    phone: row.phone,
    email: row.email ?? undefined,
    message: row.message,
    businessUnit: row.business_unit ?? "grupo",
    interestType: row.interest_type,
    referenceSlug: row.reference_slug ?? undefined,
    referenceLabel: row.reference_label ?? undefined,
    unitLabel: row.unit_label ?? undefined,
    locationText: row.location_text ?? undefined,
    locationLat: row.location_lat ?? undefined,
    locationLng: row.location_lng ?? undefined,
    status: row.status,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at,
  };
}

function mapBusinessArea(row: BusinessAreaRow): BusinessAreaContent {
  const fallback = fallbackContent.businessPages[row.slug];

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

function mapSiteSettings(row?: SiteSettingsRow): SiteSettings {
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

function normalizePathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensureUuid(value: string) {
  if (UUID_REGEX.test(value)) {
    return value;
  }

  return crypto.randomUUID();
}

export async function getCmsSession() {
  const client = getClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function onCmsAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const client = getClient();
  return client.auth.onAuthStateChange(callback);
}

export async function signInCms(email: string, password: string) {
  const client = getClient();
  const normalizedEmail = assertEmail(email);
  const normalizedPassword = assertPassword(password);
  const { error } = await client.auth.signInWithPassword({
    email: normalizedEmail,
    password: normalizedPassword,
  });

  if (error) {
    throw error;
  }
}

export async function signUpCms(email: string, password: string) {
  if (!isCmsSignupEnabled) {
    throw new Error(
      "La creacion publica de accesos esta desactivada. Usa el panel de administracion para habilitar nuevos usuarios."
    );
  }

  const client = getClient();
  const normalizedEmail = assertEmail(email);
  const normalizedPassword = assertPassword(password);
  const { error, data } = await client.auth.signUp({
    email: normalizedEmail,
    password: normalizedPassword,
  });

  if (error) {
    throw error;
  }

  const userId = data.user?.id;
  const userEmail = data.user?.email ?? normalizedEmail;

  if (userId) {
    const { count, error: countError } = await client
      .from("admin_profiles")
      .select("user_id", { count: "exact", head: true });

    if (countError) {
      throw countError;
    }

    const { error: profileError } = await client.from("admin_profiles").upsert(
      {
        user_id: userId,
        full_name: userEmail,
        email: userEmail,
        role: count && count > 0 ? "architect" : "admin",
        business_unit: count && count > 0 ? "constructora" : "grupo",
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      throw profileError;
    }
  }
}

export async function signOutCms() {
  const client = getClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function loadCmsDashboard(): Promise<CmsDashboardData> {
  const client = getClient();
  const session = await getCmsSession();

  if (!session?.user) {
    throw new Error("Sesion no disponible.");
  }

  const { data: existingProfile, error: existingProfileError } = await client
    .from("admin_profiles")
    .select("user_id")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (existingProfileError) {
    throw existingProfileError;
  }

  if (!existingProfile) {
    const { error: ensureProfileError } = await client.from("admin_profiles").insert({
      user_id: session.user.id,
      full_name: session.user.email ?? "Administrador",
      email: session.user.email ?? null,
      role: "architect",
      business_unit: "constructora",
    });

    if (ensureProfileError) {
      throw ensureProfileError;
    }
  }

  const [
    settingsRes,
    servicesRes,
    worksRes,
    buildingsRes,
    propertiesRes,
    teamRes,
    leadsRes,
    businessAreaPagesRes,
    profileRes,
    profilesRes,
    workAssignmentsRes,
    buildingAssignmentsRes,
  ] = await Promise.all([
    client.from("site_settings").select("*").limit(1).maybeSingle(),
    client
      .from("services")
      .select(
        "id,slug,title,text,description,hero_image,gallery,price_label,is_price_visible,requires_location,lead_prompt,before_after_items,display_order"
      )
      .order("display_order"),
    client
      .from("works")
      .select(
        "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,brochure_file,metrics,map_embed_url,updates:work_updates(id,title,date,summary,performed_by,photos,is_deleted)"
      )
      .order("created_at", { ascending: false }),
    client
      .from("buildings")
      .select(
        "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,brochure_file,metrics,amenities,map_embed_url,units:building_units(id,title,bedrooms,bathrooms,area,floor_label,price,is_available)"
      )
      .order("created_at", { ascending: false }),
    client
      .from("real_estate_properties")
      .select(
        "id,slug,title,category,operation,status,location,price,area,bedrooms,bathrooms,summary,description,hero_image,gallery,features,map_embed_url"
      )
      .order("created_at", { ascending: false }),
    client
      .from("team_members")
      .select("id,name,role,bio,image,display_order")
      .order("display_order", { ascending: true }),
    client
      .from("leads")
      .select(
        "id,full_name,national_id,phone,email,message,business_unit,interest_type,reference_slug,reference_label,unit_label,location_text,location_lat,location_lng,status,admin_notes,created_at"
      )
      .order("created_at", { ascending: false }),
    client
      .from("business_area_pages")
      .select(
        "slug,label,eyebrow,title,accent,description,image,tagline,coverage,coverage_description,primary_label,secondary_label,services,highlights,process,faqs,contact_prompt,footer_blurb"
      ),
    client
      .from("admin_profiles")
      .select("user_id,full_name,email,role,business_unit")
      .eq("user_id", session.user.id)
      .maybeSingle(),
    client
      .from("admin_profiles")
      .select("user_id,full_name,email,role,business_unit")
      .order("created_at"),
    client.from("work_assignments").select("work_id,user_id"),
    client.from("building_assignments").select("building_id,user_id"),
  ]);

  const error =
    settingsRes.error ??
    servicesRes.error ??
    worksRes.error ??
    buildingsRes.error ??
    propertiesRes.error ??
    teamRes.error ??
    leadsRes.error ??
    businessAreaPagesRes.error ??
    profileRes.error ??
    profilesRes.error ??
    workAssignmentsRes.error ??
    buildingAssignmentsRes.error;

  if (error) {
    throw error;
  }

  const profile = profileRes.data as AdminProfileRow | null;
  const allProfiles = (profilesRes.data ?? []) as AdminProfileRow[];
  const workAssignments = (workAssignmentsRes.data ?? []) as WorkAssignmentRow[];
  const buildingAssignments = (buildingAssignmentsRes.data ?? []) as BuildingAssignmentRow[];

  const viewerRole = profile?.role ?? "admin";
  const viewerBusinessUnit = profile?.business_unit ?? "constructora";
  const viewerWorkIds = workAssignments
    .filter((assignment) => assignment.user_id === session.user.id)
    .map((assignment) => assignment.work_id);
  const viewerBuildingIds = buildingAssignments
    .filter((assignment) => assignment.user_id === session.user.id)
    .map((assignment) => assignment.building_id);

  const works = (worksRes.data ?? []).map((row) => mapWork(row as WorkRow));
  const buildings = (buildingsRes.data ?? []).map((row) =>
    mapBuilding(row as BuildingRow)
  );
  const properties = (propertiesRes.data ?? []).map((row) => mapProperty(row as PropertyRow));

  const filteredWorks =
    viewerRole === "admin" || viewerRole === "sales"
      ? works
      : works.filter((work) => viewerWorkIds.includes(work.id));

  const filteredBuildings =
    viewerRole === "admin" || viewerRole === "sales"
      ? buildings
      : buildings.filter((building) => viewerBuildingIds.includes(building.id));

  const staff = allProfiles.map((row) => ({
    userId: row.user_id ?? "",
    fullName: row.full_name ?? row.email ?? "Sin nombre",
    email: row.email ?? undefined,
    role: row.role ?? "sales",
    businessUnit: row.business_unit ?? "constructora",
    assignedWorkIds: workAssignments
      .filter((assignment) => assignment.user_id === row.user_id)
      .map((assignment) => assignment.work_id),
    assignedBuildingIds: buildingAssignments
      .filter((assignment) => assignment.user_id === row.user_id)
      .map((assignment) => assignment.building_id),
  }));

  const businessPages: BusinessPageMap = { ...fallbackContent.businessPages };
  for (const row of (businessAreaPagesRes.data ?? []) as BusinessAreaRow[]) {
    businessPages[row.slug] = mapBusinessArea(row);
  }

  return {
    settings: mapSiteSettings((settingsRes.data ?? undefined) as SiteSettingsRow | undefined),
    services:
      (servicesRes.data ?? []).length > 0
        ? (servicesRes.data ?? []).map((row) => mapService(row as ServiceRow))
        : fallbackContent.services,
    works: filteredWorks,
    buildings: filteredBuildings,
    properties,
    team: (teamRes.data ?? []).map((row) => mapTeam(row as TeamRow)),
    leads:
      viewerRole === "admin" || viewerRole === "sales"
        ? (leadsRes.data ?? [])
            .map((row) => mapLead(row as LeadRow))
            .filter(
              (lead) =>
                viewerRole === "admin" ||
                viewerBusinessUnit === "grupo" ||
                lead.businessUnit === viewerBusinessUnit
            )
        : [],
    businessPages,
    viewer: {
      userId: session.user.id,
      fullName: profile?.full_name ?? session.user.email ?? "Administrador",
      role: viewerRole,
      businessUnit: viewerBusinessUnit,
      email: session.user.email,
    },
    staff,
  };
}

export async function uploadCmsAsset(
  file: File,
  folder: "works" | "buildings" | "team" | "plans" | "services" | "properties",
  slugHint: string
) {
  const client = getClient();
  const safeFolder = normalizePathSegment(slugHint || "general");
  const safeName = normalizePathSegment(file.name.replace(/\.[^/.]+$/, ""));
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = `${folder}/${safeFolder}/${Date.now()}-${safeName}.${extension}`;

  const { error } = await client.storage.from("media").upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from("media").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function saveWork(work: Omit<WorkProject, "id"> & { id?: string }) {
  const client = getClient();
  const payload = {
    slug: sanitizeSlug(work.slug),
    title: sanitizeText(work.title, "El titulo", { min: 3, max: 140 }),
    category: sanitizeText(work.category, "La categoria", { min: 3, max: 80 }),
    location: sanitizeText(work.location, "La ubicacion", { min: 3, max: 120 }),
    year: sanitizeText(work.year, "El ano", { min: 4, max: 12 }),
    area: sanitizeText(work.area, "El area", { min: 2, max: 40 }),
    status: work.status,
    client_name: sanitizeText(work.clientName, "El cliente", { min: 2, max: 120 }),
    owner_name: sanitizeText(work.ownerName, "El responsable", { min: 2, max: 120 }),
    summary: sanitizeText(work.summary, "El resumen", {
      min: 12,
      max: 320,
      preserveNewlines: true,
    }),
    description: sanitizeText(work.description, "La descripcion", {
      min: 20,
      max: 2400,
      preserveNewlines: true,
    }),
    hero_image: sanitizeHttpUrl(work.heroImage, "La portada", false),
    gallery: sanitizeUrlList(work.gallery, "La imagen de galeria"),
    plan_files: sanitizeUrlList(work.planFiles, "El plano"),
    brochure_file: work.brochureFile
      ? sanitizeHttpUrl(work.brochureFile, "La ficha")
      : null,
    metrics: work.metrics.map((metric) => ({
      label: sanitizeText(metric.label, "La etiqueta de metrica", { min: 2, max: 60 }),
      value: sanitizeText(metric.value, "El valor de metrica", { min: 1, max: 140 }),
    })),
    map_embed_url: work.mapEmbedUrl
      ? sanitizeHttpUrl(work.mapEmbedUrl, "El mapa embebido")
      : null,
  };

  let workId = work.id;

  if (work.id) {
    const { error } = await client.from("works").update(payload).eq("id", work.id);
    if (error) {
      throw error;
    }
  } else {
    const { data, error } = await client
      .from("works")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    workId = data.id;
  }

  if (!workId) {
    throw new Error("No se pudo resolver el id de la obra.");
  }

  const currentUpdates = work.updates.filter((update) => !update.isDeleted);
  const deletedUpdates = work.updates.filter(
    (update) => update.isDeleted && !update.id.startsWith("temp-update-")
  );
  const existingActiveUpdates = currentUpdates.filter(
    (update) => !update.id.startsWith("temp-update-")
  );
  const newUpdates = currentUpdates.filter((update) =>
    update.id.startsWith("temp-update-")
  );

  for (const update of existingActiveUpdates) {
    const { error: updateError } = await client
      .from("work_updates")
      .update({
        title: sanitizeText(update.title, "El titulo del avance", { min: 3, max: 120 }),
        date: update.date,
        summary: sanitizeText(update.summary, "El resumen del avance", {
          min: 10,
          max: 1200,
          preserveNewlines: true,
        }),
        performed_by: update.performedBy
          ? sanitizeText(update.performedBy, "El responsable del avance", {
              min: 2,
              max: 120,
            })
          : null,
        photos: sanitizeUrlList(update.photos ?? [], "La foto del avance"),
        is_deleted: false,
        deleted_at: null,
      })
      .eq("id", update.id);

    if (updateError) {
      throw updateError;
    }
  }

  if (newUpdates.length > 0) {
    const { error: insertUpdatesError } = await client.from("work_updates").insert(
      newUpdates.map((update) => ({
        work_id: workId,
        title: sanitizeText(update.title, "El titulo del avance", { min: 3, max: 120 }),
        date: update.date,
        summary: sanitizeText(update.summary, "El resumen del avance", {
          min: 10,
          max: 1200,
          preserveNewlines: true,
        }),
        performed_by: update.performedBy
          ? sanitizeText(update.performedBy, "El responsable del avance", {
              min: 2,
              max: 120,
            })
          : null,
        photos: sanitizeUrlList(update.photos ?? [], "La foto del avance"),
        is_deleted: false,
      }))
    );

    if (insertUpdatesError) {
      throw insertUpdatesError;
    }
  }

  for (const update of deletedUpdates) {
    const { error: softDeleteError } = await client
      .from("work_updates")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        performed_by: update.performedBy ?? null,
      })
      .eq("id", update.id);

    if (softDeleteError) {
      throw softDeleteError;
    }
  }

  return workId;
}

export async function deleteWork(workId: string) {
  const client = getClient();
  const { error } = await client.from("works").delete().eq("id", workId);

  if (error) {
    throw error;
  }
}

export async function replaceWorkAssignments(workId: string, userIds: string[]) {
  const client = getClient();
  const { error: deleteError } = await client
    .from("work_assignments")
    .delete()
    .eq("work_id", workId);

  if (deleteError) {
    throw deleteError;
  }

  if (userIds.length === 0) {
    return;
  }

  const { error: insertError } = await client.from("work_assignments").insert(
    userIds.map((userId) => ({
      work_id: workId,
      user_id: userId,
    }))
  );

  if (insertError) {
    throw insertError;
  }
}

export async function saveBuilding(
  building: Omit<BuildingProject, "id"> & { id?: string }
) {
  const client = getClient();
  const payload = {
    slug: sanitizeSlug(building.slug),
    title: sanitizeText(building.title, "El titulo", { min: 3, max: 140 }),
    category: sanitizeText(building.category, "La categoria", { min: 3, max: 80 }),
    location: sanitizeText(building.location, "La ubicacion", { min: 3, max: 120 }),
    year: sanitizeText(building.year, "El ano", { min: 4, max: 12 }),
    area: sanitizeText(building.area, "El area", { min: 2, max: 40 }),
    status: building.status,
    client_name: sanitizeText(building.clientName, "El cliente", { min: 2, max: 120 }),
    owner_name: sanitizeText(building.ownerName, "El responsable", { min: 2, max: 120 }),
    summary: sanitizeText(building.summary, "El resumen", {
      min: 12,
      max: 320,
      preserveNewlines: true,
    }),
    description: sanitizeText(building.description, "La descripcion", {
      min: 20,
      max: 2400,
      preserveNewlines: true,
    }),
    hero_image: sanitizeHttpUrl(building.heroImage, "La portada", false),
    gallery: sanitizeUrlList(building.gallery, "La imagen de galeria"),
    plan_files: sanitizeUrlList(building.planFiles, "El plano"),
    brochure_file: building.brochureFile
      ? sanitizeHttpUrl(building.brochureFile, "La ficha")
      : null,
    metrics: building.metrics.map((metric) => ({
      label: sanitizeText(metric.label, "La etiqueta de metrica", { min: 2, max: 60 }),
      value: sanitizeText(metric.value, "El valor de metrica", { min: 1, max: 140 }),
    })),
    amenities: sanitizeStringList(building.amenities, "La amenidad", 80),
    map_embed_url: building.mapEmbedUrl
      ? sanitizeHttpUrl(building.mapEmbedUrl, "El mapa embebido")
      : null,
  };

  let buildingId = building.id;

  if (building.id) {
    const { error } = await client
      .from("buildings")
      .update(payload)
      .eq("id", building.id);

    if (error) {
      throw error;
    }
  } else {
    const { data, error } = await client
      .from("buildings")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    buildingId = data.id;
  }

  if (!buildingId) {
    throw new Error("No se pudo resolver el id del edificio.");
  }

  const { error: deleteUnitsError } = await client
    .from("building_units")
    .delete()
    .eq("building_id", buildingId);

  if (deleteUnitsError) {
    throw deleteUnitsError;
  }

  if (building.units.length > 0) {
    const { error: insertUnitsError } = await client.from("building_units").insert(
      building.units.map((unit) => ({
        building_id: buildingId,
        title: sanitizeText(unit.title, "El nombre de la unidad", { min: 2, max: 120 }),
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        area: sanitizeText(unit.area, "El area de la unidad", { min: 2, max: 40 }),
        floor_label: sanitizeText(unit.floorLabel, "El piso o ubicacion", {
          min: 2,
          max: 80,
        }),
        price: unit.price ? sanitizeText(unit.price, "El precio", { max: 40 }) : null,
        is_available: unit.isAvailable,
      }))
    );

    if (insertUnitsError) {
      throw insertUnitsError;
    }
  }

  return buildingId;
}

export async function deleteBuilding(buildingId: string) {
  const client = getClient();
  const { error } = await client.from("buildings").delete().eq("id", buildingId);

  if (error) {
    throw error;
  }
}

export async function saveProperty(
  property: Omit<RealEstateProperty, "id"> & { id?: string }
) {
  const client = getClient();
  const payload = {
    slug: sanitizeSlug(property.slug),
    title: sanitizeText(property.title, "El titulo de la propiedad", { min: 3, max: 140 }),
    category: sanitizeText(property.category, "La categoria", { min: 2, max: 80 }),
    operation: property.operation,
    status: property.status,
    location: sanitizeText(property.location, "La ubicacion", { min: 3, max: 140 }),
    price: sanitizeText(property.price, "El precio", { min: 2, max: 80 }),
    area: sanitizeText(property.area, "El area", { min: 2, max: 40 }),
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    summary: sanitizeText(property.summary, "El resumen", {
      min: 12,
      max: 320,
      preserveNewlines: true,
    }),
    description: sanitizeText(property.description, "La descripcion", {
      min: 20,
      max: 2400,
      preserveNewlines: true,
    }),
    hero_image: sanitizeHttpUrl(property.heroImage, "La imagen principal", false),
    gallery: sanitizeUrlList(property.gallery, "La galeria"),
    features: sanitizeStringList(property.features, "La caracteristica", 120),
    map_embed_url: property.mapEmbedUrl
      ? sanitizeHttpUrl(property.mapEmbedUrl, "El mapa embebido")
      : null,
  };

  let propertyId = property.id;

  if (property.id) {
    const { error } = await client
      .from("real_estate_properties")
      .update(payload)
      .eq("id", property.id);

    if (error) {
      throw error;
    }
  } else {
    const { data, error } = await client
      .from("real_estate_properties")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    propertyId = data.id;
  }

  if (!propertyId) {
    throw new Error("No se pudo resolver el id de la propiedad.");
  }

  return propertyId;
}

export async function deleteProperty(propertyId: string) {
  const client = getClient();
  const { error } = await client
    .from("real_estate_properties")
    .delete()
    .eq("id", propertyId);

  if (error) {
    throw error;
  }
}

export async function replaceBuildingAssignments(
  buildingId: string,
  userIds: string[]
) {
  const client = getClient();
  const { error: deleteError } = await client
    .from("building_assignments")
    .delete()
    .eq("building_id", buildingId);

  if (deleteError) {
    throw deleteError;
  }

  if (userIds.length === 0) {
    return;
  }

  const { error: insertError } = await client.from("building_assignments").insert(
    userIds.map((userId) => ({
      building_id: buildingId,
      user_id: userId,
    }))
  );

  if (insertError) {
    throw insertError;
  }
}

export async function saveTeamMember(member: Omit<TeamMember, "id"> & { id?: string }) {
  const client = getClient();
  const payload = {
    name: sanitizeText(member.name, "El nombre", { min: 2, max: 120 }),
    role: sanitizeText(member.role, "El cargo", { min: 2, max: 80 }),
    bio: sanitizeText(member.bio, "La bio", {
      min: 10,
      max: 1200,
      preserveNewlines: true,
    }),
    image: sanitizeHttpUrl(member.image, "La foto", false),
  };

  if (member.id) {
    const { error } = await client
      .from("team_members")
      .update(payload)
      .eq("id", member.id);

    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await client.from("team_members").insert(payload);

  if (error) {
    throw error;
  }
}

export async function saveSiteSettings(settings: SiteSettings) {
  const client = getClient();
  const payload = {
    company_name: sanitizeText(settings.companyName, "El nombre de empresa", {
      min: 3,
      max: 160,
    }),
    hero_eyebrow: sanitizeText(settings.heroEyebrow, "El eyebrow del hero", {
      min: 3,
      max: 120,
    }),
    hero_title: sanitizeText(settings.heroTitle, "El titulo del hero", {
      min: 3,
      max: 120,
    }),
    hero_accent: sanitizeText(settings.heroAccent, "El acento del hero", {
      min: 2,
      max: 120,
    }),
    hero_description: sanitizeText(settings.heroDescription, "La descripcion del hero", {
      min: 10,
      max: 420,
      preserveNewlines: true,
    }),
    hero_image: sanitizeHttpUrl(settings.heroImage, "La imagen del hero", false),
    tagline: sanitizeText(settings.tagline, "El tagline", { min: 4, max: 180 }),
    location: sanitizeText(settings.location, "La ubicacion general", {
      min: 2,
      max: 140,
    }),
    contact: {
      phone: sanitizePhone(settings.contact.phone),
      whatsapp: sanitizePhone(settings.contact.whatsapp),
      email: assertEmail(settings.contact.email, "correo principal"),
      address: sanitizeText(settings.contact.address, "La direccion principal", {
        min: 6,
        max: 180,
      }),
      branches: settings.contact.branches.map((branch) => ({
        id: branch.id,
        name: sanitizeText(branch.name, "El nombre de sucursal", { min: 3, max: 120 }),
        address: sanitizeText(branch.address, "La direccion de sucursal", {
          min: 6,
          max: 180,
        }),
        phone: sanitizePhone(branch.phone),
      })),
    },
    process_steps: settings.processSteps.map((item) => ({
      id: item.id,
      order: sanitizeText(item.order, "El orden del paso", { min: 1, max: 8 }),
      title: sanitizeText(item.title, "El titulo del paso", { min: 2, max: 120 }),
      text: sanitizeText(item.text, "La descripcion del paso", {
        min: 10,
        max: 320,
        preserveNewlines: true,
      }),
    })),
    testimonials: settings.testimonials.map((item) => ({
      id: item.id,
      name: sanitizeText(item.name, "El nombre del testimonio", { min: 2, max: 120 }),
      role: sanitizeText(item.role, "El cargo del testimonio", { min: 2, max: 120 }),
      company: item.company
        ? sanitizeText(item.company, "La empresa del testimonio", { min: 2, max: 120 })
        : "",
      quote: sanitizeText(item.quote, "El comentario del testimonio", {
        min: 10,
        max: 420,
        preserveNewlines: true,
      }),
    })),
    faqs: settings.faqs.map((item) => ({
      id: item.id,
      question: sanitizeText(item.question, "La pregunta frecuente", {
        min: 6,
        max: 180,
      }),
      answer: sanitizeText(item.answer, "La respuesta frecuente", {
        min: 10,
        max: 600,
        preserveNewlines: true,
      }),
    })),
  };

  if (settings.id) {
    const { error } = await client
      .from("site_settings")
      .update(payload)
      .eq("id", settings.id);

    if (error) {
      throw error;
    }
    return;
  }

  const { error } = await client.from("site_settings").insert(payload);

  if (error) {
    throw error;
  }
}

export async function saveBusinessAreaPage(page: BusinessAreaContent) {
  const client = getClient();

  const payload = {
    slug: page.slug,
    label: sanitizeText(page.label, "La etiqueta del area", { min: 3, max: 120 }),
    eyebrow: sanitizeText(page.eyebrow, "El eyebrow del area", { min: 3, max: 120 }),
    title: sanitizeText(page.title, "El titulo del area", { min: 3, max: 120 }),
    accent: sanitizeText(page.accent, "El acento del area", { min: 2, max: 120 }),
    description: sanitizeText(page.description, "La descripcion del area", {
      min: 10,
      max: 420,
      preserveNewlines: true,
    }),
    image: sanitizeHttpUrl(page.image, "La imagen del area", false),
    tagline: sanitizeText(page.tagline, "El tagline del area", {
      min: 6,
      max: 220,
      preserveNewlines: true,
    }),
    coverage: sanitizeText(page.coverage, "La cobertura", { min: 2, max: 120 }),
    coverage_description: sanitizeText(
      page.coverageDescription,
      "La descripcion de cobertura",
      { min: 10, max: 260, preserveNewlines: true }
    ),
    primary_label: sanitizeText(page.primaryLabel, "El boton principal", { min: 2, max: 80 }),
    secondary_label: sanitizeText(page.secondaryLabel, "El boton secundario", {
      min: 2,
      max: 80,
    }),
    services: page.services.map((item) => ({
      id: sanitizeSlug(item.id),
      title: sanitizeText(item.title, "El titulo del servicio", { min: 3, max: 140 }),
      text: sanitizeText(item.text, "El texto del servicio", {
        min: 10,
        max: 320,
        preserveNewlines: true,
      }),
    })),
    highlights: page.highlights.map((item) => ({
      id: sanitizeSlug(item.id),
      title: sanitizeText(item.title, "El titulo del bloque", { min: 3, max: 140 }),
      text: sanitizeText(item.text, "El texto del bloque", {
        min: 10,
        max: 320,
        preserveNewlines: true,
      }),
    })),
    process: page.process.map((item) => ({
      id: sanitizeSlug(item.id),
      order: sanitizeText(item.order, "El orden del proceso", { min: 1, max: 10 }),
      title: sanitizeText(item.title, "El titulo del proceso", { min: 3, max: 140 }),
      text: sanitizeText(item.text, "El texto del proceso", {
        min: 10,
        max: 320,
        preserveNewlines: true,
      }),
    })),
    faqs: page.faqs.map((item) => ({
      id: sanitizeSlug(item.id),
      question: sanitizeText(item.question, "La pregunta frecuente", {
        min: 6,
        max: 180,
      }),
      answer: sanitizeText(item.answer, "La respuesta frecuente", {
        min: 10,
        max: 420,
        preserveNewlines: true,
      }),
    })),
    contact_prompt: sanitizeText(page.contactPrompt, "El texto de contacto", {
      min: 10,
      max: 360,
      preserveNewlines: true,
    }),
    footer_blurb: sanitizeText(page.footerBlurb, "El texto del footer", {
      min: 10,
      max: 220,
      preserveNewlines: true,
    }),
  };

  const { error } = await client.from("business_area_pages").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    throw error;
  }
}

export async function saveServices(services: ServiceItem[]) {
  const client = getClient();
  const validServices = services.map((service, index) =>
    buildServicePayload(service, index + 1)
  );
  const currentIds = validServices.map((service) => service.id);

  if (currentIds.length > 0) {
    const { error: deleteError } = await client
      .from("services")
      .delete()
      .not("id", "in", `(${currentIds.map((id) => `"${id}"`).join(",")})`);

    if (deleteError) {
      throw deleteError;
    }
  } else {
    const { error: deleteError } = await client.from("services").delete().not("id", "is", null);

    if (deleteError) {
      throw deleteError;
    }
  }

  if (validServices.length === 0) {
    return;
  }

  const { error } = await client
    .from("services")
    .upsert(validServices, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

function buildServicePayload(service: ServiceItem, displayOrder: number) {
  return {
    id: ensureUuid(service.id),
    slug: sanitizeSlug(service.slug),
    title: sanitizeText(service.title, "El titulo del servicio", {
      min: 3,
      max: 120,
    }),
    text: sanitizeText(service.text, "El texto del servicio", {
      min: 10,
      max: 260,
      preserveNewlines: true,
    }),
    description: sanitizeText(service.description || service.text, "La descripcion del servicio", {
      min: 20,
      max: 2400,
      preserveNewlines: true,
    }),
    hero_image: service.heroImage
      ? sanitizeHttpUrl(service.heroImage, "La portada del servicio")
      : "",
    gallery: sanitizeUrlList(service.gallery, "La imagen del servicio"),
    price_label: service.isPriceVisible
      ? sanitizeText(service.priceLabel ?? "", "El precio visible", {
          min: 2,
          max: 120,
        })
      : null,
    is_price_visible: service.isPriceVisible,
    requires_location: service.requiresLocation,
    lead_prompt: service.leadPrompt
      ? sanitizeText(service.leadPrompt, "La guia comercial del servicio", {
          min: 10,
          max: 420,
          preserveNewlines: true,
        })
      : "",
    before_after_items: service.beforeAfterItems.map((item, itemIndex) => ({
      id: item.id || `compare-${displayOrder}-${itemIndex + 1}`,
      title: sanitizeText(item.title, "El titulo del comparador", {
        min: 2,
        max: 120,
      }),
      beforeImage: sanitizeHttpUrl(item.beforeImage, `La imagen antes ${itemIndex + 1}`, false),
      afterImage: sanitizeHttpUrl(item.afterImage, `La imagen despues ${itemIndex + 1}`, false),
    })),
    display_order: displayOrder,
  };
}

export async function saveService(service: ServiceItem, displayOrder: number) {
  const client = getClient();
  const payload = buildServicePayload(service, displayOrder);
  const { error } = await client.from("services").upsert(payload, { onConflict: "id" });

  if (error) {
    throw error;
  }
}

export async function deleteService(serviceId: string) {
  const client = getClient();
  const { error } = await client.from("services").delete().eq("id", serviceId);

  if (error) {
    throw error;
  }
}

export async function saveAdminProfile(profile: {
  userId: string;
  fullName: string;
  email?: string;
  role: CmsUserRole;
  businessUnit: CmsBusinessUnit;
}) {
  const client = getClient();
  const { error } = await client.from("admin_profiles").upsert(
    {
      user_id: profile.userId,
      full_name: sanitizeText(profile.fullName, "El nombre del acceso", {
        min: 2,
        max: 120,
      }),
      email: profile.email ? assertEmail(profile.email) : null,
      role: profile.role,
      business_unit: profile.businessUnit,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw error;
  }
}

export async function deleteTeamMember(memberId: string) {
  const client = getClient();
  const { error } = await client.from("team_members").delete().eq("id", memberId);

  if (error) {
    throw error;
  }
}

export async function updateLeadRecord(
  leadId: string,
  status: LeadStatus,
  adminNotes: string
) {
  const client = getClient();
  const { error } = await client
    .from("leads")
    .update({
      status,
      admin_notes: adminNotes
        ? sanitizeText(adminNotes, "Las notas internas", {
            max: 2000,
            preserveNewlines: true,
          })
        : null,
    })
    .eq("id", leadId);

  if (error) {
    throw error;
  }
}

export function buildEmptyWork(): Omit<WorkProject, "id"> {
  return {
    slug: "",
    title: "",
    category: "Obra residencial",
    location: "",
    year: "",
    area: "",
    status: "planificacion",
    clientName: "",
    ownerName: "",
    summary: "",
    description: "",
    heroImage: "",
    gallery: [],
    planFiles: [],
    brochureFile: "",
    metrics: [],
    updates: [],
    mapEmbedUrl: "",
  };
}

export function buildEmptyBuilding(): Omit<BuildingProject, "id"> {
  return {
    slug: "",
    title: "",
    category: "Edificio residencial",
    location: "",
    year: "",
    area: "",
    status: "planificacion",
    clientName: "",
    ownerName: "",
    summary: "",
    description: "",
    heroImage: "",
    gallery: [],
    planFiles: [],
    brochureFile: "",
    metrics: [],
    amenities: [],
    units: [],
    mapEmbedUrl: "",
  };
}

export function buildEmptyProperty(): Omit<RealEstateProperty, "id"> {
  return {
    slug: "",
    title: "",
    category: "Casa",
    operation: "venta",
    status: "disponible",
    location: "",
    price: "",
    area: "",
    bedrooms: 0,
    bathrooms: 0,
    summary: "",
    description: "",
    heroImage: "",
    gallery: [],
    features: [],
    mapEmbedUrl: "",
  };
}

export function buildEmptyTeamMember(): Omit<TeamMember, "id"> {
  return {
    name: "",
    role: "",
    bio: "",
    image: "",
  };
}

export function parseMetricsText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(":");
      return {
        label: label.trim(),
        value: rest.join(":").trim(),
      };
    })
    .filter((item) => item.label && item.value);
}

export function formatMetricsText(metrics: WorkProject["metrics"]) {
  return metrics.map((metric) => `${metric.label}: ${metric.value}`).join("\n");
}

export function parseUpdatesText(value: string): ProgressUpdate[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const parts = line.split("|").map((chunk) => chunk.trim());
      return {
        id: `temp-update-${index}`,
        date: parts[0] ?? "",
        title: parts[1] ?? "",
        summary: parts.slice(2).join(" | "),
        photos: [],
      };
    })
    .filter((item) => item.date && item.title && item.summary);
}

export function formatUpdatesText(updates: ProgressUpdate[]) {
  return updates
    .map((update) => `${update.date} | ${update.title} | ${update.summary}`)
    .join("\n");
}

export function parseUnitsText(value: string): BuildingUnit[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [title, bedrooms, bathrooms, area, floorLabel, price, availability] =
        line.split("|").map((chunk) => chunk.trim());

      return {
        id: `temp-unit-${index}`,
        title: title ?? "",
        bedrooms: Number(bedrooms ?? 0),
        bathrooms: Number(bathrooms ?? 0),
        area: area ?? "",
        floorLabel: floorLabel ?? "",
        price: price || undefined,
        isAvailable: availability?.toLowerCase() !== "reservado",
      };
    })
    .filter(
      (unit) =>
        unit.title &&
        Number.isFinite(unit.bedrooms) &&
        Number.isFinite(unit.bathrooms) &&
        unit.area &&
        unit.floorLabel
    );
}

export function formatUnitsText(units: BuildingUnit[]) {
  return units
    .map(
      (unit) =>
        `${unit.title} | ${unit.bedrooms} | ${unit.bathrooms} | ${unit.area} | ${unit.floorLabel} | ${unit.price ?? ""} | ${unit.isAvailable ? "disponible" : "reservado"}`
    )
    .join("\n");
}

export function parseListText(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function formatListText(values: string[]) {
  return values.join("\n");
}
