import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import type {
  BuildingProject,
  BuildingUnit,
  CmsUserRole,
  LeadStatus,
  ProgressUpdate,
  ProjectStatus,
  SiteSettings,
  TeamMember,
  WorkProject,
} from "../types/cms";
import { fallbackContent } from "../data/fallback-content";
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
  const { error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }
}

export async function signUpCms(email: string, password: string) {
  const client = getClient();
  const { error, data } = await client.auth.signUp({ email, password });

  if (error) {
    throw error;
  }

  const userId = data.user?.id;
  const userEmail = data.user?.email ?? email;

  if (userId) {
    const { error: profileError } = await client.from("admin_profiles").upsert(
      {
        user_id: userId,
        full_name: userEmail,
        email: userEmail,
        role: "architect",
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
    client
      .from("works")
      .select(
        "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,metrics,map_embed_url,updates:work_updates(id,title,date,summary,performed_by,photos,is_deleted)"
      )
      .order("created_at", { ascending: false }),
    client
      .from("buildings")
      .select(
        "id,slug,title,category,location,year,area,status,client_name,owner_name,summary,description,hero_image,gallery,plan_files,metrics,amenities,map_embed_url,units:building_units(id,title,bedrooms,bathrooms,area,floor_label,price,is_available)"
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
    slug: work.slug,
    title: work.title,
    category: work.category,
    location: work.location,
    year: work.year,
    area: work.area,
    status: work.status,
    client_name: work.clientName,
    owner_name: work.ownerName,
    summary: work.summary,
    description: work.description,
    hero_image: work.heroImage,
    gallery: work.gallery,
    plan_files: work.planFiles,
    metrics: work.metrics,
    map_embed_url: work.mapEmbedUrl ?? null,
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
        title: update.title,
        date: update.date,
        summary: update.summary,
        performed_by: update.performedBy ?? null,
        photos: update.photos ?? [],
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
        title: update.title,
        date: update.date,
        summary: update.summary,
        performed_by: update.performedBy ?? null,
        photos: update.photos ?? [],
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
    slug: building.slug,
    title: building.title,
    category: building.category,
    location: building.location,
    year: building.year,
    area: building.area,
    status: building.status,
    client_name: building.clientName,
    owner_name: building.ownerName,
    summary: building.summary,
    description: building.description,
    hero_image: building.heroImage,
    gallery: building.gallery,
    plan_files: building.planFiles,
    metrics: building.metrics,
    amenities: building.amenities,
    map_embed_url: building.mapEmbedUrl ?? null,
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
        title: unit.title,
        bedrooms: unit.bedrooms,
        bathrooms: unit.bathrooms,
        area: unit.area,
        floor_label: unit.floorLabel,
        price: unit.price ?? null,
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
    name: member.name,
    role: member.role,
    bio: member.bio,
    image: member.image,
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
    company_name: settings.companyName,
    hero_eyebrow: settings.heroEyebrow,
    hero_title: settings.heroTitle,
    hero_accent: settings.heroAccent,
    hero_description: settings.heroDescription,
    hero_image: settings.heroImage,
    tagline: settings.tagline,
    location: settings.location,
    contact: settings.contact,
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
      full_name: profile.fullName,
      email: profile.email ?? null,
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
      admin_notes: adminNotes || null,
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
