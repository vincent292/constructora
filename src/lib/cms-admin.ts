import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type {
  BuildingProject,
  BuildingUnit,
  CmsUserRole,
  LeadStatus,
  ProgressUpdate,
  ProjectStatus,
  ServiceItem,
  SiteSettings,
  TeamMember,
  WorkProject,
} from "../types/cms";
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
  phone: string;
  email: string;
  message: string;
  interestType: "obra" | "edificio" | "departamento" | "general";
  referenceSlug?: string;
  unitLabel?: string;
  status: LeadStatus;
  adminNotes?: string;
  createdAt: string;
};

export type CmsViewerProfile = {
  userId?: string;
  fullName: string;
  role: CmsUserRole;
  email?: string;
};

export type CmsStaffProfile = {
  userId: string;
  fullName: string;
  email?: string;
  role: CmsUserRole;
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

type LeadRow = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  message: string;
  interest_type: LeadRecord["interestType"];
  reference_slug: string | null;
  unit_label: string | null;
  status: LeadStatus;
  admin_notes: string | null;
  created_at: string;
};

type AdminProfileRow = {
  user_id?: string;
  full_name: string | null;
  email: string | null;
  role: CmsUserRole | null;
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

export type CmsDashboardData = {
  settings: SiteSettings;
  services: ServiceItem[];
  works: WorkProject[];
  buildings: BuildingProject[];
  team: TeamMember[];
  leads: LeadRecord[];
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

function mapLead(row: LeadRow): LeadRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    message: row.message,
    interestType: row.interest_type,
    referenceSlug: row.reference_slug ?? undefined,
    unitLabel: row.unit_label ?? undefined,
    status: row.status,
    adminNotes: row.admin_notes ?? undefined,
    createdAt: row.created_at,
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
    teamRes,
    leadsRes,
    profileRes,
    profilesRes,
    workAssignmentsRes,
    buildingAssignmentsRes,
  ] = await Promise.all([
    client.from("site_settings").select("*").limit(1).maybeSingle(),
    client.from("services").select("id,title,text,display_order").order("display_order"),
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
      .from("team_members")
      .select("id,name,role,bio,image,display_order")
      .order("display_order", { ascending: true }),
    client
      .from("leads")
      .select(
        "id,full_name,phone,email,message,interest_type,reference_slug,unit_label,status,admin_notes,created_at"
      )
      .order("created_at", { ascending: false }),
    client
      .from("admin_profiles")
      .select("user_id,full_name,email,role")
      .eq("user_id", session.user.id)
      .maybeSingle(),
    client.from("admin_profiles").select("user_id,full_name,email,role").order("created_at"),
    client.from("work_assignments").select("work_id,user_id"),
    client.from("building_assignments").select("building_id,user_id"),
  ]);

  const error =
    settingsRes.error ??
    servicesRes.error ??
    worksRes.error ??
    buildingsRes.error ??
    teamRes.error ??
    leadsRes.error ??
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
    assignedWorkIds: workAssignments
      .filter((assignment) => assignment.user_id === row.user_id)
      .map((assignment) => assignment.work_id),
    assignedBuildingIds: buildingAssignments
      .filter((assignment) => assignment.user_id === row.user_id)
      .map((assignment) => assignment.building_id),
  }));

  return {
    settings: mapSiteSettings((settingsRes.data ?? undefined) as SiteSettingsRow | undefined),
    services:
      (servicesRes.data ?? []).length > 0
        ? (servicesRes.data ?? []).map((row) => ({
            id: row.id,
            title: row.title,
            text: row.text,
          }))
        : fallbackContent.services,
    works: filteredWorks,
    buildings: filteredBuildings,
    team: (teamRes.data ?? []).map((row) => mapTeam(row as TeamRow)),
    leads:
      viewerRole === "admin" || viewerRole === "sales"
        ? (leadsRes.data ?? []).map((row) => mapLead(row as LeadRow))
        : [],
    viewer: {
      userId: session.user.id,
      fullName: profile?.full_name ?? session.user.email ?? "Administrador",
      role: viewerRole,
      email: session.user.email,
    },
    staff,
  };
}

export async function uploadCmsAsset(
  file: File,
  folder: "works" | "buildings" | "team" | "plans",
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

export async function saveServices(services: ServiceItem[]) {
  const client = getClient();
  const { error: deleteError } = await client.from("services").delete().neq("id", "");

  if (deleteError) {
    throw deleteError;
  }

  if (services.length === 0) {
    return;
  }

  const { error } = await client.from("services").insert(
    services.map((service, index) => ({
      id: service.id,
      title: sanitizeText(service.title, "El titulo del servicio", {
        min: 3,
        max: 120,
      }),
      text: sanitizeText(service.text, "El texto del servicio", {
        min: 10,
        max: 260,
        preserveNewlines: true,
      }),
      display_order: index + 1,
    }))
  );

  if (error) {
    throw error;
  }
}

export async function saveAdminProfile(profile: {
  userId: string;
  fullName: string;
  email?: string;
  role: CmsUserRole;
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
