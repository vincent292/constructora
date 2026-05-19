import React, { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Building2,
  FolderKanban,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Mail,
  MapPin,
  MessageSquareMore,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import type {
  BranchOffice,
  BuildingUnit,
  BuildingProject,
  CmsUserRole,
  SiteSettings,
  DetailMetric,
  LeadStatus,
  ProgressUpdate,
  ProjectStatus,
  TeamMember,
  WorkProject,
} from "./types/cms";
import {
  buildEmptyBuilding,
  buildEmptyTeamMember,
  buildEmptyWork,
  deleteBuilding,
  deleteTeamMember,
  deleteWork,
  type CmsStaffProfile,
  getCmsSession,
  loadCmsDashboard,
  onCmsAuthStateChange,
  replaceBuildingAssignments,
  replaceWorkAssignments,
  saveAdminProfile,
  saveBuilding,
  saveSiteSettings,
  saveTeamMember,
  saveWork,
  signInCms,
  signOutCms,
  signUpCms,
  updateLeadRecord,
  uploadCmsAsset,
  type CmsDashboardData,
  type LeadRecord,
} from "./lib/cms-admin";
import { isSupabaseConfigured } from "./lib/supabase";

type CmsTab = "works" | "buildings" | "team" | "leads" | "settings";
type ModalType = "work" | "building" | "team" | "staff" | null;

type WorkEditorState = {
  id?: string;
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
  mapEmbedUrl: string;
  assignedStaffIds: string[];
};

type BuildingEditorState = {
  id?: string;
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
  amenities: string[];
  units: BuildingUnit[];
  mapEmbedUrl: string;
  assignedStaffIds: string[];
};

type UnitEditorState = {
  id: string;
  title: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  floorLabel: string;
  price: string;
  isAvailable: boolean;
};

type TeamEditorState = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  image: string;
};

type StaffEditorState = {
  userId: string;
  fullName: string;
  email: string;
  role: CmsUserRole;
  assignedWorkIds: string[];
  assignedBuildingIds: string[];
};

type SiteSettingsEditorState = SiteSettings;

const projectStatuses: ProjectStatus[] = [
  "planificacion",
  "en_progreso",
  "finalizado",
];

const leadStatuses: LeadStatus[] = [
  "nuevo",
  "contactado",
  "seguimiento",
  "cerrado",
];

const tabDefinitions: {
  key: CmsTab;
  label: string;
  icon: typeof FolderKanban;
}[] = [
  { key: "works", label: "Obras", icon: FolderKanban },
  { key: "buildings", label: "Edificios", icon: Building2 },
  { key: "team", label: "Nosotros", icon: Users },
  { key: "leads", label: "Leads", icon: Mail },
  { key: "settings", label: "Ajustes", icon: ShieldCheck },
];

const authHighlights = [
  {
    title: "Obras y edificios",
    text: "Gestiona proyectos, galerias, planos y unidades sin tocar codigo.",
    icon: FolderKanban,
  },
  {
    title: "Equipo y estructura",
    text: "Organiza responsables, gerentes y bloque Nosotros desde el mismo backoffice.",
    icon: Users,
  },
  {
    title: "Leads y seguimiento",
    text: "Convierte solicitudes en un flujo comercial ordenado para tu equipo.",
    icon: MessageSquareMore,
  },
] as const;

const metricLibrary = [
  "Cliente",
  "Estado",
  "Entrega",
  "Modalidad",
  "Supervision",
  "Unidades",
  "Programa",
  "Inversion",
  "Arquitectura",
  "Estructura",
  "Ubicacion",
  "Plazo",
];

const amenityLibrary = [
  "Lobby doble altura",
  "Terraza social",
  "Parqueos",
  "Seguridad 24/7",
  "Cowork",
  "Rooftop",
  "Piscina temperada",
  "Gym",
  "Business lounge",
  "Sauna",
  "Area de ninos",
  "Churrasquero",
  "Ascensor",
  "Recepcion",
];

function roleLabel(role: CmsUserRole) {
  if (role === "architect") return "Arquitecto";
  if (role === "site_manager") return "Encargado de obra";
  if (role === "sales") return "Ventas";
  return "Administrador";
}

function canAccessTab(role: CmsUserRole, tab: CmsTab) {
  if (role === "admin") return true;
  if (tab === "settings") return false;
  if (role === "architect") return tab === "works" || tab === "buildings" || tab === "team";
  if (role === "site_manager") return tab === "works" || tab === "buildings";
  return tab === "buildings" || tab === "leads";
}

function statusLabel(value: string) {
  if (value === "en_progreso") return "En progreso";
  if (value === "finalizado") return "Finalizado";
  return "Planificacion";
}

function leadLabel(value: string) {
  if (value === "contactado") return "Contactado";
  if (value === "seguimiento") return "Seguimiento";
  if (value === "cerrado") return "Cerrado";
  return "Nuevo";
}

function normalizeWhatsappPhone(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");

  if (digits.length === 8) {
    return `591${digits}`;
  }

  return digits;
}

function buildWhatsappUrl(phone: string, message: string) {
  const normalizedPhone = normalizeWhatsappPhone(phone);
  const encodedMessage = encodeURIComponent(message);

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`;
}

function formatFileName(source: string) {
  try {
    const pathname = new URL(source).pathname;
    return decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? source);
  } catch {
    return source;
  }
}

function CmsBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,220,99,0.18),transparent_24%),radial-gradient(circle_at_84%_8%,rgba(255,255,255,0.08),transparent_20%),linear-gradient(180deg,#0d0c0a_0%,#16120e_48%,#0d0c0a_100%)]" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.35)_1px,transparent_1px)] [background-size:68px_68px]" />
      <div className="absolute left-[15%] top-[12%] h-[280px] w-[280px] rounded-full bg-[#FFDC63]/18 blur-[120px]" />
      <div className="absolute right-[8%] top-[22%] h-[220px] w-[220px] rounded-full bg-white/10 blur-[110px]" />
    </div>
  );
}

function CardShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border border-[#d9c8b0] bg-white/70 shadow-[0_24px_60px_rgba(88,62,28,0.08)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm text-stone-700">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#d5b24a]"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm text-stone-700">
      <span>{label}</span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-[1.4rem] border border-stone-200 bg-white px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#d5b24a]"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <label className="grid gap-2 text-sm text-stone-700">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border border-stone-200 bg-white px-4 text-stone-900 outline-none focus:border-[#d5b24a]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function toWorkEditorState(work: Omit<WorkProject, "id"> & { id?: string }): WorkEditorState {
  return {
    id: work.id,
    slug: work.slug,
    title: work.title,
    category: work.category,
    location: work.location,
    year: work.year,
    area: work.area,
    status: work.status,
    clientName: work.clientName,
    ownerName: work.ownerName,
    summary: work.summary,
    description: work.description,
    heroImage: work.heroImage,
    gallery: work.gallery,
    planFiles: work.planFiles,
    metrics: work.metrics,
    updates: work.updates,
    mapEmbedUrl: work.mapEmbedUrl ?? "",
    assignedStaffIds: [],
  };
}

function toBuildingEditorState(
  building: Omit<BuildingProject, "id"> & { id?: string }
): BuildingEditorState {
  return {
    id: building.id,
    slug: building.slug,
    title: building.title,
    category: building.category,
    location: building.location,
    year: building.year,
    area: building.area,
    status: building.status,
    clientName: building.clientName,
    ownerName: building.ownerName,
    summary: building.summary,
    description: building.description,
    heroImage: building.heroImage,
    gallery: building.gallery,
    planFiles: building.planFiles,
    metrics: building.metrics,
    amenities: building.amenities,
    units: building.units,
    mapEmbedUrl: building.mapEmbedUrl ?? "",
    assignedStaffIds: [],
  };
}

function toTeamEditorState(member: Omit<TeamMember, "id"> & { id?: string }): TeamEditorState {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    bio: member.bio,
    image: member.image,
  };
}

function toStaffEditorState(profile?: CmsStaffProfile): StaffEditorState {
  return {
    userId: profile?.userId ?? "",
    fullName: profile?.fullName ?? "",
    email: profile?.email ?? "",
    role: profile?.role ?? "architect",
    assignedWorkIds: profile?.assignedWorkIds ?? [],
    assignedBuildingIds: profile?.assignedBuildingIds ?? [],
  };
}

function buildEmptyUnit(): UnitEditorState {
  return {
    id: `temp-unit-${Date.now()}`,
    title: "",
    bedrooms: 1,
    bathrooms: 1,
    area: "",
    floorLabel: "",
    price: "",
    isAvailable: true,
  };
}

function buildEmptyBranch(): BranchOffice {
  return {
    id: `branch-${Date.now()}`,
    name: "",
    address: "",
    phone: "",
  };
}

function MediaField({
  title,
  description,
  items,
  onRemove,
  onUpload,
  accept,
  multiple = true,
}: {
  title: string;
  description: string;
  items: string[];
  onRemove: (index: number) => void;
  onUpload: (files: FileList | null) => void;
  accept: string;
  multiple?: boolean;
}) {
  return (
    <CardShell className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <p className="text-sm leading-6 text-stone-500">{description}</p>
        </div>
        <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black">
          <Upload className="h-4 w-4" />
          Subir
          <input
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            onChange={(event) => onUpload(event.target.files)}
          />
        </label>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => {
            const imageLike = /\.(png|jpe?g|webp|gif|svg)$/i.test(item);
            return (
              <div
                key={`${title}-${index}`}
                className="overflow-hidden rounded-[1.3rem] border border-stone-200 bg-[#fbf7f0]"
              >
                {imageLike ? (
                  <img
                    src={item}
                    alt={`${title} ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center bg-[#f2eadf] text-sm text-stone-600">
                    {formatFileName(item)}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="truncate text-sm text-stone-700">{formatFileName(item)}</p>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-8 text-center text-sm text-stone-500">
          Todavia no hay archivos cargados.
        </div>
      )}
    </CardShell>
  );
}

function UpdateField({
  update,
  index,
  onChange,
  onRemove,
  onUploadPhotos,
  onRemovePhoto,
}: {
  update: ProgressUpdate;
  index: number;
  onChange: (nextUpdate: ProgressUpdate) => void;
  onRemove: () => void;
  onUploadPhotos: (files: FileList | null) => void;
  onRemovePhoto: (photoIndex: number) => void;
}) {
  return (
    <CardShell className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#b88b16]">
            Avance {index + 1}
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Registro individual para arquitectura u obra.
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <InputField
          label="Fecha"
          value={update.date}
          onChange={(value) => onChange({ ...update, date: value })}
          type="date"
        />
        <InputField
          label="Realizado por"
          value={update.performedBy ?? ""}
          onChange={(value) => onChange({ ...update, performedBy: value })}
          placeholder="Ing. o Arq. responsable"
        />
      </div>
      <div className="mt-4 grid gap-4">
        <InputField
          label="Titulo del avance"
          value={update.title}
          onChange={(value) => onChange({ ...update, title: value })}
        />
        <TextareaField
          label="Descripcion"
          value={update.summary}
          onChange={(value) => onChange({ ...update, summary: value })}
          rows={4}
        />
      </div>

      <div className="mt-4 rounded-[1.4rem] border border-stone-200 bg-[#fbf7f0] p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-stone-900">Fotos del avance</p>
            <p className="text-sm text-stone-500">
              Sube evidencias del dia realizado.
            </p>
          </div>
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black">
            <ImagePlus className="h-4 w-4" />
            Agregar fotos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => onUploadPhotos(event.target.files)}
            />
          </label>
        </div>

        {update.photos.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {update.photos.map((photo, photoIndex) => (
              <div
                key={`${update.id}-photo-${photoIndex}`}
                className="overflow-hidden rounded-[1.2rem] border border-stone-200 bg-white"
              >
                <img
                  src={photo}
                  alt={`Avance ${index + 1} foto ${photoIndex + 1}`}
                  className="h-28 w-full object-cover"
                />
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <p className="truncate text-sm text-stone-600">
                    {formatFileName(photo)}
                  </p>
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(photoIndex)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-[1.1rem] border border-dashed border-stone-300 bg-white px-4 py-6 text-center text-sm text-stone-500">
            Sin fotos cargadas todavia.
          </div>
        )}
      </div>
    </CardShell>
  );
}

function EditorModal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[2.2rem] border border-[#d8c4a8] bg-[#f8f1e6] shadow-[0_30px_90px_rgba(28,20,8,0.22)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#e6d7c2] px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#b88b16]">
              Editor
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-900">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[calc(92vh-112px)] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}

function CmsHeader({
  title,
  description,
  viewerName,
  viewerRole,
  onLogout,
}: {
  title: string;
  description: string;
  viewerName: string;
  viewerRole: CmsUserRole;
  onLogout: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-black/55 px-5 py-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:px-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FFDC63]/20 bg-[#FFDC63]/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#FFDC63]">
            <ShieldCheck className="h-3.5 w-3.5" />
            CMS Mondoza
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Sesion</p>
            <p className="mt-1 font-medium text-white">{viewerName}</p>
            <p className="mt-1 text-sm text-[#FFDC63]">{roleLabel(viewerRole)}</p>
          </div>
          <a
            href="/"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white"
          >
            Ver sitio
          </a>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}

function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-12 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/50 focus:border-[#FFDC63]/35 lg:max-w-sm"
    />
  );
}

function ActionOverlay({
  show,
  text,
}: {
  show: boolean;
  text: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/35 backdrop-blur-md">
      <div className="rounded-[2rem] border border-white/10 bg-black/55 px-8 py-8 text-center text-white shadow-2xl shadow-black/30">
        <img
          src="/logo/logo.png"
          alt="Mendoza"
          className="mx-auto h-auto w-[92px] animate-pulse object-contain"
        />
        <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#FFDC63]">
          Construyendo tus suenos
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-sm text-stone-200">
          <LoaderCircle className="h-4 w-4 animate-spin text-[#FFDC63]" />
          {text}
        </div>
      </div>
    </div>
  );
}

function StaffAccessCard({
  profile,
  onEdit,
}: {
  profile: CmsStaffProfile;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 text-left text-white transition hover:border-[#FFDC63]/25 hover:bg-white/[0.07]"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#FFDC63]">
            {roleLabel(profile.role)}
          </p>
          <h3 className="mt-2 text-xl font-semibold">{profile.fullName}</h3>
          <p className="mt-1 text-sm text-stone-400">{profile.email || "Sin correo"}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-stone-200">
          {profile.assignedWorkIds.length + profile.assignedBuildingIds.length} asignaciones
        </span>
      </div>
    </button>
  );
}

function AssignmentSelector({
  title,
  description,
  options,
  selectedIds,
  onToggle,
}: {
  title: string;
  description: string;
  options: CmsStaffProfile[];
  selectedIds: string[];
  onToggle: (userId: string, checked: boolean) => void;
}) {
  return (
    <CardShell className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
        </div>
        <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-xs font-medium text-[#9a7317]">
          {selectedIds.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {options.length > 0 ? (
          options.map((profile) => {
            const checked = selectedIds.includes(profile.userId);
            return (
              <label
                key={profile.userId}
                className="flex items-start gap-3 rounded-[1.3rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => onToggle(profile.userId, event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-[#b88b16] focus:ring-[#b88b16]"
                />
                <span>
                  <strong className="block text-stone-900">{profile.fullName}</strong>
                  <span className="text-stone-500">
                    {roleLabel(profile.role)} {profile.email ? `- ${profile.email}` : ""}
                  </span>
                </span>
              </label>
            );
          })
        ) : (
          <div className="rounded-[1.3rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-8 text-center text-sm text-stone-500">
            Todavia no hay arquitectos o encargados registrados.
          </div>
        )}
      </div>
    </CardShell>
  );
}

function UnitCard({
  unit,
  onEdit,
  onDelete,
}: {
  unit: BuildingUnit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <CardShell className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#b88b16]">
            {unit.isAvailable ? "Disponible" : "No disponible"}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">{unit.title}</h3>
          <p className="mt-2 text-sm text-stone-500">
            {unit.bedrooms} habitaciones · {unit.bathrooms} banos · {unit.area}
          </p>
          <p className="mt-1 text-sm text-stone-500">{unit.floorLabel}</p>
          {unit.price ? (
            <p className="mt-3 text-sm font-medium text-stone-900">{unit.price}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-9 items-center rounded-full border border-stone-200 bg-white px-3 text-sm text-stone-700"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </CardShell>
  );
}

function MetricsEditor({
  title,
  description,
  metrics,
  suggestions,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  description: string;
  metrics: DetailMetric[];
  suggestions: string[];
  onAdd: (label: string) => void;
  onChange: (index: number, nextMetric: DetailMetric) => void;
  onRemove: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredSuggestions = suggestions.filter(
    (item) =>
      item.toLowerCase().includes(query.toLowerCase()) &&
      !metrics.some((metric) => metric.label.toLowerCase() === item.toLowerCase())
  );

  return (
    <CardShell className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-900">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
        </div>
        <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-xs font-medium text-[#9a7317]">
          {metrics.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar metrica para agregar"
          className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#d5b24a]"
        />
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.slice(0, 8).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onAdd(item);
                setQuery("");
              }}
              className="inline-flex h-10 items-center rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700"
            >
              <Plus className="mr-2 h-4 w-4 text-[#b88b16]" />
              {item}
            </button>
          ))}
          {query.trim() && !suggestions.some((item) => item.toLowerCase() === query.toLowerCase()) ? (
            <button
              type="button"
              onClick={() => {
                onAdd(query.trim());
                setQuery("");
              }}
              className="inline-flex h-10 items-center rounded-full border border-dashed border-[#d5b24a] bg-[#fff9ef] px-4 text-sm text-[#9a7317]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar "{query.trim()}"
            </button>
          ) : null}
        </div>
      </div>

      {metrics.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {metrics.map((metric, index) => (
            <div
              key={`${metric.label}-${index}`}
              className="grid gap-3 rounded-[1.3rem] border border-stone-200 bg-white p-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
            >
              <InputField
                label="Campo"
                value={metric.label}
                onChange={(value) => onChange(index, { ...metric, label: value })}
              />
              <InputField
                label="Valor"
                value={metric.value}
                onChange={(value) => onChange(index, { ...metric, value })}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-8 text-center text-sm text-stone-500">
          Todavia no hay metricas cargadas.
        </div>
      )}
    </CardShell>
  );
}

function AmenityEditor({
  amenities,
  suggestions,
  onAdd,
  onRemove,
}: {
  amenities: string[];
  suggestions: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
}) {
  const [query, setQuery] = useState("");
  const filteredSuggestions = suggestions.filter(
    (item) =>
      item.toLowerCase().includes(query.toLowerCase()) &&
      !amenities.some((amenity) => amenity.toLowerCase() === item.toLowerCase())
  );

  return (
    <CardShell className="p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-stone-900">Amenidades</h3>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Busca en el catalogo y agrega con un click las amenidades del edificio.
          </p>
        </div>
        <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-xs font-medium text-[#9a7317]">
          {amenities.length}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar amenidad para agregar"
          className="h-11 rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#d5b24a]"
        />
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.slice(0, 10).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onAdd(item);
                setQuery("");
              }}
              className="inline-flex h-10 items-center rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700"
            >
              <Plus className="mr-2 h-4 w-4 text-[#b88b16]" />
              {item}
            </button>
          ))}
          {query.trim() && !suggestions.some((item) => item.toLowerCase() === query.toLowerCase()) ? (
            <button
              type="button"
              onClick={() => {
                onAdd(query.trim());
                setQuery("");
              }}
              className="inline-flex h-10 items-center rounded-full border border-dashed border-[#d5b24a] bg-[#fff9ef] px-4 text-sm text-[#9a7317]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar "{query.trim()}"
            </button>
          ) : null}
        </div>
      </div>

      {amenities.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {amenities.map((amenity, index) => (
            <div
              key={`${amenity}-${index}`}
              className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
            >
              {amenity}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-8 text-center text-sm text-stone-500">
          Todavia no hay amenidades cargadas.
        </div>
      )}
    </CardShell>
  );
}

function WorkCard({ work, onEdit }: { work: WorkProject; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] text-left shadow-2xl shadow-black/15 transition hover:-translate-y-1"
    >
      <img
        src={work.heroImage}
        alt={work.title}
        className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#b88b16]">
              {statusLabel(work.status)}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              {work.title}
            </h3>
          </div>
          <span className="rounded-full bg-[#fff1c3] px-3 py-1 text-xs font-medium text-[#8c6611]">
            {work.gallery.length} fotos
          </span>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-300">
          {work.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-400">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#b88b16]" />
            {work.location}
          </span>
          <span>{work.planFiles.length} planos</span>
          <span>{work.updates.length} avances</span>
        </div>
      </div>
    </button>
  );
}

function BuildingCard({
  building,
  onEdit,
}: {
  building: BuildingProject;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] text-left shadow-2xl shadow-black/15 transition hover:-translate-y-1"
    >
      <img
        src={building.heroImage}
        alt={building.title}
        className="h-56 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#b88b16]">
              {statusLabel(building.status)}
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              {building.title}
            </h3>
          </div>
          <span className="rounded-full bg-[#fff1c3] px-3 py-1 text-xs font-medium text-[#8c6611]">
            {building.units.length} unidades
          </span>
        </div>
        <p className="mt-4 line-clamp-3 text-sm leading-7 text-stone-300">
          {building.summary}
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-400">
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#b88b16]" />
            {building.location}
          </span>
          <span>{building.planFiles.length} planos</span>
          <span>
            {building.units.filter((unit) => unit.isAvailable).length} disponibles
          </span>
        </div>
      </div>
    </button>
  );
}

function TeamMemberCard({
  member,
  onEdit,
}: {
  member: TeamMember;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.05] text-left shadow-2xl shadow-black/15 transition hover:-translate-y-1"
    >
      <img src={member.image} alt={member.name} className="h-56 w-full object-cover" />
      <div className="p-5">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#b88b16]">
          {member.role}
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
          {member.name}
        </h3>
        <p className="mt-4 line-clamp-4 text-sm leading-7 text-stone-300">
          {member.bio}
        </p>
      </div>
    </button>
  );
}

function LeadCard({
  lead,
  onSave,
}: {
  lead: LeadRecord;
  onSave: (lead: LeadRecord, status: LeadStatus, notes: string) => void;
}) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.adminNotes ?? "");
  const whatsappMessage = [
    `Hola ${lead.fullName}, gracias por contactar con Mondoza Construcciones.`,
    "Recibimos tu solicitud y podemos realizarte una cotizacion segun lo que necesitas.",
    lead.unitLabel ? `Unidad consultada: ${lead.unitLabel}` : "",
    lead.referenceSlug ? `Referencia: ${lead.referenceSlug}` : "",
    "Podemos coordinar los detalles por este medio.",
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = buildWhatsappUrl(lead.phone, whatsappMessage);

  useEffect(() => {
    setStatus(lead.status);
    setNotes(lead.adminNotes ?? "");
  }, [lead.id, lead.status, lead.adminNotes]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 shadow-2xl shadow-black/15 backdrop-blur-xl">
      <div className="grid gap-5 xl:grid-cols-[1fr_380px] xl:items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[#e8d6aa] bg-[#fff4d4] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#9a7317]">
              {lead.interestType}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs uppercase tracking-[0.18em] text-stone-300">
              {leadLabel(lead.status)}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{lead.fullName}</h3>
            <p className="mt-1 text-sm text-stone-400">
              {lead.email} / {lead.phone}
            </p>
            {(lead.referenceSlug || lead.unitLabel) && (
              <p className="mt-2 text-sm text-[#FFDC63]">
                {[lead.referenceSlug, lead.unitLabel].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <p className="max-w-3xl whitespace-pre-line text-sm leading-7 text-stone-300">
            {lead.message}
          </p>
        </div>
        <div className="grid gap-3 rounded-[1.6rem] border border-white/10 bg-black/25 p-4">
          <label className="grid gap-2 text-sm text-stone-200">
            <span>Estado</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as LeadStatus)}
              className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-stone-900 outline-none focus:border-[#FFDC63]"
            >
              {leadStatuses.map((item) => (
                <option key={item} value={item}>
                  {leadLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-stone-200">
            <span>Notas internas</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Seguimiento, acuerdos, proxima llamada..."
              className="rounded-[1.3rem] border border-white/10 bg-white px-4 py-3 text-stone-900 outline-none placeholder:text-stone-400 focus:border-[#FFDC63]"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button
              type="button"
              onClick={() => onSave(lead, status, notes)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
            >
              <Save className="h-4 w-4" />
              Guardar
            </button>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-400/12 px-5 text-sm font-medium text-emerald-100"
            >
              <MessageSquareMore className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CmsApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dashboard, setDashboard] = useState<CmsDashboardData>({
    settings: {
      companyName: "Mondoza Construcciones Civiles en General",
      heroEyebrow: "Construccion civil y edificacion",
      heroTitle: "Construyendo",
      heroAccent: "tus suenos",
      heroDescription: "",
      heroImage: "",
      tagline: "",
      location: "",
      contact: {
        phone: "",
        whatsapp: "",
        email: "",
        address: "",
        branches: [],
      },
    },
    works: [],
    buildings: [],
    team: [],
    leads: [],
    viewer: { fullName: "Administrador", role: "admin" },
    staff: [],
  });
  const [activeTab, setActiveTab] = useState<CmsTab>("works");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [workForm, setWorkForm] = useState<WorkEditorState>(
    toWorkEditorState(buildEmptyWork())
  );
  const [buildingForm, setBuildingForm] = useState<BuildingEditorState>(
    toBuildingEditorState(buildEmptyBuilding())
  );
  const [teamForm, setTeamForm] = useState<TeamEditorState>(
    toTeamEditorState(buildEmptyTeamMember())
  );
  const [settingsForm, setSettingsForm] = useState<SiteSettingsEditorState>(
    dashboard.settings
  );
  const [staffForm, setStaffForm] = useState<StaffEditorState>(toStaffEditorState());
  const [unitForm, setUnitForm] = useState<UnitEditorState>(buildEmptyUnit());
  const [editingUnitIndex, setEditingUnitIndex] = useState<number | null>(null);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [workSearch, setWorkSearch] = useState("");
  const [buildingSearch, setBuildingSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    mode: "login" as "login" | "signup",
  });
  const [screenState, setScreenState] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const visibleTabs = tabDefinitions.filter((tab) =>
    canAccessTab(dashboard.viewer.role, tab.key)
  );
  const canManageProjectMeta = dashboard.viewer.role === "admin";
  const canManageAssignments = dashboard.viewer.role === "admin";
  const canManageUpdates =
    dashboard.viewer.role === "admin" ||
    dashboard.viewer.role === "architect" ||
    dashboard.viewer.role === "site_manager";
  const assignableStaff = dashboard.staff.filter(
    (profile) => profile.role === "architect" || profile.role === "site_manager"
  );

  const buildAssignedStaffLabel = (selectedIds: string[], fallback: string) => {
    const names = assignableStaff
      .filter((profile) => selectedIds.includes(profile.userId))
      .map((profile) => profile.fullName)
      .filter(Boolean);

    return names.length > 0 ? names.join(", ") : fallback;
  };

  const openWorkEditor = (work?: WorkProject) => {
    const base = work ? toWorkEditorState(work) : toWorkEditorState(buildEmptyWork());
    const assignedStaffIds = work
      ? dashboard.staff
          .filter((profile) => profile.assignedWorkIds.includes(work.id))
          .map((profile) => profile.userId)
      : [];

    setWorkForm({ ...base, assignedStaffIds });
    setActiveModal("work");
  };

  const openBuildingEditor = (building?: BuildingProject) => {
    const base = building
      ? toBuildingEditorState(building)
      : toBuildingEditorState(buildEmptyBuilding());
    const assignedStaffIds = building
      ? dashboard.staff
          .filter((profile) => profile.assignedBuildingIds.includes(building.id))
          .map((profile) => profile.userId)
      : [];

    setBuildingForm({ ...base, assignedStaffIds });
    setActiveModal("building");
  };

  const openUnitEditor = (index?: number) => {
    if (typeof index === "number") {
      setUnitForm({
        ...buildingForm.units[index],
        price: buildingForm.units[index].price ?? "",
      });
      setEditingUnitIndex(index);
    } else {
      setUnitForm(buildEmptyUnit());
      setEditingUnitIndex(null);
    }
    setUnitModalOpen(true);
  };

  const refreshDashboard = async () => {
    setScreenState({ loading: true, message: "", error: false });

    try {
      const nextDashboard = await loadCmsDashboard();
      setDashboard(nextDashboard);

      if (!canAccessTab(nextDashboard.viewer.role, activeTab)) {
        const fallbackTab =
          tabDefinitions.find((tab) => canAccessTab(nextDashboard.viewer.role, tab.key))
            ?.key ?? "works";
        setActiveTab(fallbackTab);
      }

      setScreenState({ loading: false, message: "", error: false });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo cargar el CMS.",
        error: true,
      });
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    getCmsSession()
      .then((nextSession) => setSession(nextSession))
      .finally(() => setAuthLoading(false));

    const subscription = onCmsAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    void refreshDashboard();
  }, [session]);

  useEffect(() => {
    setSettingsForm(dashboard.settings);
  }, [dashboard.settings]);

  const filteredWorks = dashboard.works.filter((work) =>
    `${work.title} ${work.location} ${work.category}`
      .toLowerCase()
      .includes(workSearch.toLowerCase())
  );
  const filteredBuildings = dashboard.buildings.filter((building) =>
    `${building.title} ${building.location} ${building.category}`
      .toLowerCase()
      .includes(buildingSearch.toLowerCase())
  );
  const filteredTeam = dashboard.team.filter((member) =>
    `${member.name} ${member.role} ${member.bio}`
      .toLowerCase()
      .includes(teamSearch.toLowerCase())
  );
  const filteredStaff = dashboard.staff.filter((profile) =>
    `${profile.fullName} ${profile.email ?? ""} ${profile.role}`
      .toLowerCase()
      .includes(staffSearch.toLowerCase())
  );

  const uploadMany = async (
    files: FileList | null,
    folder: "works" | "buildings" | "team" | "plans",
    slugHint: string
  ) => {
    if (!files?.length) return [];

    setScreenState({ loading: true, message: "Subiendo archivos...", error: false });

    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadCmsAsset(file, folder, slugHint))
      );
      setScreenState({ loading: false, message: "Archivos subidos.", error: false });
      return urls;
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudieron subir los archivos.",
        error: true,
      });
      return [];
    }
  };

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setScreenState({ loading: true, message: "", error: false });

    try {
      if (loginForm.mode === "signup") {
        await signUpCms(loginForm.email, loginForm.password);
        setScreenState({
          loading: false,
          message: "Usuario creado. Si el entorno local no exige confirmacion, ya puedes entrar.",
          error: false,
        });
      } else {
        await signInCms(loginForm.email, loginForm.password);
        setScreenState({ loading: false, message: "", error: false });
      }
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo autenticar en Supabase.",
        error: true,
      });
    }
  };

  const addEmptyUpdate = () => {
    setWorkForm((current) => ({
      ...current,
      updates: [
        ...current.updates,
        {
          id: `temp-update-${Date.now()}`,
          title: "",
          date: "",
          summary: "",
          performedBy: "",
          photos: [],
        },
      ],
    }));
  };

  const saveCurrentWork = async () => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      const savedWorkId = await saveWork({
        id: workForm.id,
        slug: workForm.slug,
        title: workForm.title,
        category: workForm.category,
        location: workForm.location,
        year: workForm.year,
        area: workForm.area,
        status: workForm.status,
        clientName: workForm.clientName,
        ownerName: buildAssignedStaffLabel(workForm.assignedStaffIds, workForm.ownerName),
        summary: workForm.summary,
        description: workForm.description,
        heroImage: workForm.heroImage,
        gallery: workForm.gallery,
        planFiles: workForm.planFiles,
        metrics: workForm.metrics,
        updates: workForm.updates,
        mapEmbedUrl: workForm.mapEmbedUrl || undefined,
      });
      if (canManageProjectMeta) {
        await replaceWorkAssignments(savedWorkId, workForm.assignedStaffIds);
      }
      await refreshDashboard();
      setActiveModal(null);
      setScreenState({
        loading: false,
        message: "Obra guardada correctamente.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo guardar la obra.",
        error: true,
      });
    }
  };

  const saveCurrentBuilding = async () => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      const savedBuildingId = await saveBuilding({
        id: buildingForm.id,
        slug: buildingForm.slug,
        title: buildingForm.title,
        category: buildingForm.category,
        location: buildingForm.location,
        year: buildingForm.year,
        area: buildingForm.area,
        status: buildingForm.status,
        clientName: buildingForm.clientName,
        ownerName: buildAssignedStaffLabel(
          buildingForm.assignedStaffIds,
          buildingForm.ownerName
        ),
        summary: buildingForm.summary,
        description: buildingForm.description,
        heroImage: buildingForm.heroImage,
        gallery: buildingForm.gallery,
        planFiles: buildingForm.planFiles,
        metrics: buildingForm.metrics,
        amenities: buildingForm.amenities,
        units: buildingForm.units,
        mapEmbedUrl: buildingForm.mapEmbedUrl || undefined,
      });
      if (canManageProjectMeta) {
        await replaceBuildingAssignments(
          savedBuildingId,
          buildingForm.assignedStaffIds
        );
      }
      await refreshDashboard();
      setActiveModal(null);
      setScreenState({
        loading: false,
        message: "Edificio guardado correctamente.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo guardar el edificio.",
        error: true,
      });
    }
  };

  const saveCurrentTeam = async () => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      await saveTeamMember(teamForm);
      await refreshDashboard();
      setActiveModal(null);
      setScreenState({
        loading: false,
        message: "Miembro guardado correctamente.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo guardar el miembro.",
        error: true,
      });
    }
  };

  const saveCurrentSettings = async () => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      await saveSiteSettings(settingsForm);
      await refreshDashboard();
      setScreenState({
        loading: false,
        message: "Ajustes del sitio actualizados.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudieron guardar los ajustes del sitio.",
        error: true,
      });
    }
  };

  const saveCurrentStaff = async () => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      await saveAdminProfile({
        userId: staffForm.userId,
        fullName: staffForm.fullName,
        email: staffForm.email || undefined,
        role: staffForm.role,
      });

      for (const work of dashboard.works) {
        const assignedUserIds = dashboard.staff
          .filter(
            (profile) =>
              profile.userId !== staffForm.userId &&
              profile.assignedWorkIds.includes(work.id)
          )
          .map((profile) => profile.userId);

        if (staffForm.assignedWorkIds.includes(work.id)) {
          assignedUserIds.push(staffForm.userId);
        }

        await replaceWorkAssignments(work.id, assignedUserIds);
      }

      for (const building of dashboard.buildings) {
        const assignedUserIds = dashboard.staff
          .filter(
            (profile) =>
              profile.userId !== staffForm.userId &&
              profile.assignedBuildingIds.includes(building.id)
          )
          .map((profile) => profile.userId);

        if (staffForm.assignedBuildingIds.includes(building.id)) {
          assignedUserIds.push(staffForm.userId);
        }

        await replaceBuildingAssignments(building.id, assignedUserIds);
      }

      await refreshDashboard();
      setActiveModal(null);
      setScreenState({
        loading: false,
        message: "Perfil de acceso actualizado.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo actualizar el perfil de acceso.",
        error: true,
      });
    }
  };

  const handleLeadUpdate = async (lead: LeadRecord, status: LeadStatus, notes: string) => {
    setScreenState({ loading: true, message: "", error: false });
    try {
      await updateLeadRecord(lead.id, status, notes);
      await refreshDashboard();
      setScreenState({
        loading: false,
        message: "Lead actualizado.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setScreenState({
        loading: false,
        message: "No se pudo actualizar el lead.",
        error: true,
      });
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="relative min-h-screen overflow-hidden px-5 py-8 text-stone-900 md:px-8">
        <CmsBackground />
        <div className="relative z-10 mx-auto max-w-6xl">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#dccbb3] bg-white/80 px-4 py-2 text-sm text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </a>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <CardShell className="p-6 sm:p-8">
              <img src="/logo/logo.png" alt="Mendoza" className="h-auto w-[112px] object-contain" />
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-stone-900">
                Conectamos Supabase local y el CMS queda listo.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                El panel ya esta preparado con login, carga de imagenes, planos,
                avances estructurados y gestion de leads. Solo falta enlazar la
                instancia local.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {authHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.6rem] border border-stone-200 bg-[#fbf7f0] p-4"
                    >
                      <Icon className="h-5 w-5 text-[#b88b16]" />
                      <p className="mt-4 text-base font-medium text-stone-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardShell>

            <CardShell className="p-6 sm:p-8">
              <div className="grid gap-5">
                <div className="rounded-[1.6rem] border border-stone-200 bg-[#fbf7f0] p-5">
                  <p className="text-sm font-medium text-[#b88b16]">1. Levantar Docker y Supabase</p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-900 p-4 text-sm text-stone-100">{`npx supabase start
npx supabase status -o env`}</pre>
                </div>
                <div className="rounded-[1.6rem] border border-stone-200 bg-[#fbf7f0] p-5">
                  <p className="text-sm font-medium text-[#b88b16]">2. Crear .env.local</p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-900 p-4 text-sm text-stone-100">{`VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=tu_anon_key_local`}</pre>
                </div>
                <div className="rounded-[1.6rem] border border-stone-200 bg-[#fbf7f0] p-5">
                  <p className="text-sm font-medium text-[#b88b16]">3. Aplicar la base</p>
                  <pre className="mt-4 overflow-x-auto rounded-2xl bg-stone-900 p-4 text-sm text-stone-100">{`npx supabase db reset`}</pre>
                </div>
              </div>
            </CardShell>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="relative grid min-h-screen place-items-center">
        <CmsBackground />
        <ActionOverlay show text="Cargando acceso al CMS..." />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden px-5 py-8 text-stone-900 md:px-8">
        <CmsBackground />
        <ActionOverlay
          show={screenState.loading}
          text={
            screenState.message ||
            (loginForm.mode === "login" ? "Ingresando al CMS..." : "Creando acceso...")
          }
        />
        <div className="relative z-10 mx-auto max-w-6xl">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#dccbb3] bg-white/80 px-4 py-2 text-sm text-stone-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al sitio
          </a>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <CardShell className="p-6 sm:p-8">
              <img src="/logo/logo.png" alt="Mendoza" className="h-auto w-[112px] object-contain" />
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#e7d4a8] bg-[#fff4d4] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#a67b12]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Acceso privado
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-stone-900">
                Ingresa al panel de Mondoza con la misma identidad del sitio.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                El acceso administra obras, edificios, planos, avances, equipo
                y leads desde una sola experiencia visual.
              </p>
              <div className="mt-8 grid gap-4">
                {authHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.6rem] border border-stone-200 bg-[#fbf7f0] p-4"
                    >
                      <Icon className="h-5 w-5 text-[#b88b16]" />
                      <p className="mt-4 text-base font-medium text-stone-900">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardShell>

            <CardShell className="p-6 sm:p-8">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setLoginForm((current) => ({ ...current, mode: "login" }))
                  }
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                    loginForm.mode === "login"
                      ? "bg-[#FFDC63] text-black"
                      : "border border-stone-200 bg-white text-stone-800"
                  }`}
                >
                  Iniciar sesion
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLoginForm((current) => ({ ...current, mode: "signup" }))
                  }
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-medium ${
                    loginForm.mode === "signup"
                      ? "bg-[#FFDC63] text-black"
                      : "border border-stone-200 bg-white text-stone-800"
                  }`}
                >
                  Crear acceso
                </button>
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-stone-900">
                {loginForm.mode === "login"
                  ? "Entrar al CMS"
                  : "Crear acceso al CMS"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-500">
                {loginForm.mode === "login"
                  ? "Usa tu usuario de Supabase Auth para entrar al backoffice."
                  : "El nuevo usuario nace con rol de arquitecto. Luego el administrador lo asigna a obras o edificios desde el CMS."}
              </p>

              <form onSubmit={handleAuthSubmit} className="mt-6 grid gap-4">
                <InputField
                  label="Correo"
                  value={loginForm.email}
                  onChange={(value) =>
                    setLoginForm((current) => ({ ...current, email: value }))
                  }
                  type="email"
                />
                <InputField
                  label="Contrasena"
                  value={loginForm.password}
                  onChange={(value) =>
                    setLoginForm((current) => ({ ...current, password: value }))
                  }
                  type="password"
                />
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-stone-900 px-5 font-medium text-white"
                >
                  {screenState.loading
                    ? "Procesando..."
                    : loginForm.mode === "login"
                      ? "Entrar ahora"
                      : "Crear acceso"}
                </button>
              </form>

              {screenState.message && (
                <p
                  className={`mt-4 text-sm ${
                    screenState.error ? "text-rose-500" : "text-emerald-600"
                  }`}
                >
                  {screenState.message}
                </p>
              )}
            </CardShell>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 text-white md:px-6 md:py-6">
      <CmsBackground />
      <ActionOverlay
        show={screenState.loading}
        text={screenState.message || "Guardando cambios en el CMS..."}
      />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        <CmsHeader
          title={
            activeTab === "works"
              ? "Obras en gestion"
              : activeTab === "buildings"
                ? "Edificios y unidades"
                : activeTab === "team"
                  ? "Nosotros y responsables"
                  : activeTab === "leads"
                    ? "Leads y seguimiento"
                    : "Ajustes del sitio"
          }
          description={
            activeTab === "works"
              ? "Las obras ahora se administran como tarjetas amplias y cada ficha abre un editor modal con galeria, planos y avances estructurados."
              : activeTab === "buildings"
                ? "Los edificios usan el mismo lenguaje visual y dejan listos planos, galeria, amenidades y unidades."
                : activeTab === "team"
                  ? "Gestiona duenos, gerentes y responsables desde una experiencia mas visual y menos tecnica."
                  : activeTab === "leads"
                    ? "Las solicitudes se revisan en un tablero claro con estado, notas y acceso directo a WhatsApp."
                    : "Administra marca, textos publicos, contacto y sucursales visibles en la landing."
          }
          viewerName={dashboard.viewer.fullName}
          viewerRole={dashboard.viewer.role}
          onLogout={() => void signOutCms()}
        />

        <div className="mt-4 grid gap-4 xl:grid-cols-[240px_1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/55 p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.05] p-4">
              <img src="/logo/logo.png" alt="Mendoza" className="h-auto w-[94px] object-contain" />
              <p className="mt-4 text-sm leading-6 text-stone-400">
                Backoffice visual para proyectos, planos y ventas.
              </p>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-1">
              {visibleTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    activeTab === key
                      ? "bg-[#FFDC63] text-black"
                      : "bg-white/[0.05] text-white hover:bg-white/[0.09]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            {screenState.message && (
              <div
                className={`mt-4 rounded-[1.4rem] px-4 py-3 text-sm ${
                  screenState.error
                    ? "bg-rose-500/10 text-rose-200"
                    : "bg-emerald-500/10 text-emerald-200"
                }`}
              >
                {screenState.message}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {activeTab === "works" && (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Obras registradas
                  </h2>
                  <SearchField
                    value={workSearch}
                    onChange={setWorkSearch}
                    placeholder="Buscar obras por titulo, ubicacion o categoria"
                  />
                  {canManageProjectMeta && (
                    <button
                      type="button"
                      onClick={() => {
                        openWorkEditor();
                      }}
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
                    >
                      <Plus className="h-4 w-4" />
                      Nueva obra
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredWorks.map((work) => (
                    <WorkCard
                      key={work.id}
                      work={work}
                      onEdit={() => {
                        openWorkEditor(work);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === "buildings" && (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Edificios registrados
                  </h2>
                  <SearchField
                    value={buildingSearch}
                    onChange={setBuildingSearch}
                    placeholder="Buscar edificios por titulo, ubicacion o categoria"
                  />
                  {canManageProjectMeta && (
                    <button
                      type="button"
                      onClick={() => {
                        openBuildingEditor();
                      }}
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo edificio
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredBuildings.map((building) => (
                    <BuildingCard
                      key={building.id}
                      building={building}
                      onEdit={() => {
                        openBuildingEditor(building);
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {activeTab === "team" && (
              <>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Equipo y responsables
                  </h2>
                  <SearchField
                    value={teamSearch}
                    onChange={setTeamSearch}
                    placeholder="Buscar perfiles publicos de nosotros"
                  />
                  {canManageProjectMeta && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeamForm(toTeamEditorState(buildEmptyTeamMember()));
                        setActiveModal("team");
                      }}
                      className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
                    >
                      <Plus className="h-4 w-4" />
                      Nuevo perfil
                    </button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                  {filteredTeam.map((member) => (
                    <TeamMemberCard
                      key={member.id}
                      member={member}
                      onEdit={() => {
                        if (!canManageProjectMeta) return;
                        setTeamForm(toTeamEditorState(member));
                        setActiveModal("team");
                      }}
                    />
                  ))}
                </div>

                {canManageAssignments && (
                  <div className="pt-2">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Accesos CMS y arquitectos
                        </h3>
                        <p className="text-sm leading-6 text-stone-400">
                          El usuario crea su cuenta primero y luego aqui le asignas rol y proyectos.
                        </p>
                      </div>
                      <SearchField
                        value={staffSearch}
                        onChange={setStaffSearch}
                        placeholder="Buscar acceso por nombre, correo o rol"
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {filteredStaff.map((profile) => (
                        <StaffAccessCard
                          key={profile.userId}
                          profile={profile}
                          onEdit={() => {
                            setStaffForm(toStaffEditorState(profile));
                            setActiveModal("staff");
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === "leads" && (
              <div className="grid gap-4">
                {dashboard.leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onSave={handleLeadUpdate} />
                ))}
              </div>
            )}

            {activeTab === "settings" && canManageProjectMeta && (
              <div className="grid gap-4">
                <CardShell className="p-5">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <InputField
                      label="Nombre de empresa"
                      value={settingsForm.companyName}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, companyName: value }))
                      }
                    />
                    <InputField
                      label="Eyebrow del hero"
                      value={settingsForm.heroEyebrow}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, heroEyebrow: value }))
                      }
                    />
                    <InputField
                      label="Titulo hero"
                      value={settingsForm.heroTitle}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, heroTitle: value }))
                      }
                    />
                    <InputField
                      label="Acento hero"
                      value={settingsForm.heroAccent}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, heroAccent: value }))
                      }
                    />
                    <InputField
                      label="Tagline"
                      value={settingsForm.tagline}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, tagline: value }))
                      }
                    />
                    <InputField
                      label="Resumen de ubicacion"
                      value={settingsForm.location}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, location: value }))
                      }
                    />
                    <InputField
                      label="Imagen hero"
                      value={settingsForm.heroImage}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, heroImage: value }))
                      }
                    />
                    <InputField
                      label="Telefono principal"
                      value={settingsForm.contact.phone}
                      onChange={(value) =>
                        setSettingsForm((current) => ({
                          ...current,
                          contact: { ...current.contact, phone: value },
                        }))
                      }
                    />
                    <InputField
                      label="WhatsApp principal"
                      value={settingsForm.contact.whatsapp}
                      onChange={(value) =>
                        setSettingsForm((current) => ({
                          ...current,
                          contact: { ...current.contact, whatsapp: value },
                        }))
                      }
                    />
                    <InputField
                      label="Correo principal"
                      value={settingsForm.contact.email}
                      onChange={(value) =>
                        setSettingsForm((current) => ({
                          ...current,
                          contact: { ...current.contact, email: value },
                        }))
                      }
                    />
                    <InputField
                      label="Direccion principal"
                      value={settingsForm.contact.address}
                      onChange={(value) =>
                        setSettingsForm((current) => ({
                          ...current,
                          contact: { ...current.contact, address: value },
                        }))
                      }
                    />
                  </div>
                  <div className="mt-4">
                    <TextareaField
                      label="Descripcion hero"
                      value={settingsForm.heroDescription}
                      onChange={(value) =>
                        setSettingsForm((current) => ({ ...current, heroDescription: value }))
                      }
                      rows={4}
                    />
                  </div>
                </CardShell>

                <CardShell className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">Sucursales</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        Puedes agregar todas las sucursales que necesites. Estas se muestran luego en contacto y footer.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSettingsForm((current) => ({
                          ...current,
                          contact: {
                            ...current.contact,
                            branches: [...current.contact.branches, buildEmptyBranch()],
                          },
                        }))
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black"
                    >
                      <Plus className="h-4 w-4" />
                      Nueva sucursal
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {settingsForm.contact.branches.map((branch, index) => (
                      <div
                        key={branch.id}
                        className="grid gap-3 rounded-[1.4rem] border border-stone-200 bg-[#fcfaf6] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-stone-900">
                            Sucursal {index + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setSettingsForm((current) => ({
                                ...current,
                                contact: {
                                  ...current.contact,
                                  branches: current.contact.branches.filter(
                                    (_, branchIndex) => branchIndex !== index
                                  ),
                                },
                              }))
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <InputField
                          label="Nombre"
                          value={branch.name}
                          onChange={(value) =>
                            setSettingsForm((current) => ({
                              ...current,
                              contact: {
                                ...current.contact,
                                branches: current.contact.branches.map((item, branchIndex) =>
                                  branchIndex === index ? { ...item, name: value } : item
                                ),
                              },
                            }))
                          }
                        />
                        <InputField
                          label="Direccion"
                          value={branch.address}
                          onChange={(value) =>
                            setSettingsForm((current) => ({
                              ...current,
                              contact: {
                                ...current.contact,
                                branches: current.contact.branches.map((item, branchIndex) =>
                                  branchIndex === index ? { ...item, address: value } : item
                                ),
                              },
                            }))
                          }
                        />
                        <InputField
                          label="Telefono"
                          value={branch.phone}
                          onChange={(value) =>
                            setSettingsForm((current) => ({
                              ...current,
                              contact: {
                                ...current.contact,
                                branches: current.contact.branches.map((item, branchIndex) =>
                                  branchIndex === index ? { ...item, phone: value } : item
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardShell>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveCurrentSettings}
                    className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
                  >
                    <Save className="h-4 w-4" />
                    Guardar ajustes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditorModal
        open={activeModal === "work"}
        title={workForm.id ? "Editar obra" : "Nueva obra"}
        description="Portada, galeria, planos y avances quedan organizados en un solo flujo mas claro."
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4">
          {!canManageProjectMeta && (
            <div className="rounded-[1.6rem] border border-[#e6d7c2] bg-[#fff9ef] p-4 text-sm leading-6 text-stone-600">
              Este acceso esta enfocado en avances. Los datos generales de la obra los administra el perfil de administrador.
            </div>
          )}

          {canManageProjectMeta && (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <InputField label="Titulo" value={workForm.title} onChange={(value) => setWorkForm((current) => ({ ...current, title: value }))} />
                <InputField label="Slug" value={workForm.slug} onChange={(value) => setWorkForm((current) => ({ ...current, slug: value }))} />
                <InputField label="Categoria" value={workForm.category} onChange={(value) => setWorkForm((current) => ({ ...current, category: value }))} />
                <InputField label="Ubicacion" value={workForm.location} onChange={(value) => setWorkForm((current) => ({ ...current, location: value }))} />
                <InputField label="Ano" value={workForm.year} onChange={(value) => setWorkForm((current) => ({ ...current, year: value }))} />
                <InputField label="Area" value={workForm.area} onChange={(value) => setWorkForm((current) => ({ ...current, area: value }))} />
                <SelectField
                  label="Estado"
                  value={workForm.status}
                  onChange={(value) =>
                    setWorkForm((current) => ({ ...current, status: value as ProjectStatus }))
                  }
                  options={projectStatuses.map((status) => ({
                    label: statusLabel(status),
                    value: status,
                  }))}
                />
                <InputField label="Cliente" value={workForm.clientName} onChange={(value) => setWorkForm((current) => ({ ...current, clientName: value }))} />
                <InputField label="Mapa embebido" value={workForm.mapEmbedUrl} onChange={(value) => setWorkForm((current) => ({ ...current, mapEmbedUrl: value }))} />
              </div>

              <TextareaField label="Resumen" value={workForm.summary} onChange={(value) => setWorkForm((current) => ({ ...current, summary: value }))} rows={3} />
              <TextareaField label="Descripcion" value={workForm.description} onChange={(value) => setWorkForm((current) => ({ ...current, description: value }))} rows={5} />
              <MetricsEditor
                title="Metricas"
                description="Agrega campos estandar como cliente, estado, entrega o modalidad, y completa el valor sin escribir formatos manuales."
                metrics={workForm.metrics}
                suggestions={metricLibrary}
                onAdd={(label) =>
                  setWorkForm((current) => ({
                    ...current,
                    metrics: [...current.metrics, { label, value: "" }],
                  }))
                }
                onChange={(index, nextMetric) =>
                  setWorkForm((current) => ({
                    ...current,
                    metrics: current.metrics.map((metric, metricIndex) =>
                      metricIndex === index ? nextMetric : metric
                    ),
                  }))
                }
                onRemove={(index) =>
                  setWorkForm((current) => ({
                    ...current,
                    metrics: current.metrics.filter((_, metricIndex) => metricIndex !== index),
                  }))
                }
              />
              <AssignmentSelector
                title="Arquitectos responsables"
                description="Selecciona uno o varios arquitectos o encargados para esta obra. Luego ellos podran ver la obra y subir avances."
                options={assignableStaff}
                selectedIds={workForm.assignedStaffIds}
                onToggle={(userId, checked) =>
                  setWorkForm((current) => ({
                    ...current,
                    assignedStaffIds: checked
                      ? [...current.assignedStaffIds, userId]
                      : current.assignedStaffIds.filter((id) => id !== userId),
                  }))
                }
              />

              <CardShell className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Portada principal</h3>
                <p className="text-sm leading-6 text-stone-500">
                  La imagen principal de la obra.
                </p>
              </div>
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black">
                <Upload className="h-4 w-4" />
                Subir portada
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const [url] = await uploadMany(
                      event.target.files,
                      "works",
                      workForm.slug || workForm.title || "obra"
                    );
                    if (url) {
                      setWorkForm((current) => ({ ...current, heroImage: url }));
                    }
                  }}
                />
              </label>
            </div>
            {workForm.heroImage ? (
              <img
                src={workForm.heroImage}
                alt={workForm.title || "Portada"}
                className="mt-4 h-56 w-full rounded-[1.4rem] object-cover"
              />
            ) : (
              <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-10 text-center text-sm text-stone-500">
                Todavia no hay portada cargada.
              </div>
            )}
              </CardShell>

              <MediaField
                title="Galeria"
                description="Sube fotos del proyecto. Ya no necesitas pegar URLs."
                items={workForm.gallery}
                accept="image/*"
                onRemove={(index) =>
                  setWorkForm((current) => ({
                    ...current,
                    gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                onUpload={async (files) => {
                  const urls = await uploadMany(
                    files,
                    "works",
                    workForm.slug || workForm.title || "obra"
                  );
                  if (urls.length > 0) {
                    setWorkForm((current) => ({
                      ...current,
                      gallery: [...current.gallery, ...urls],
                    }));
                  }
                }}
              />

              <MediaField
                title="Planos"
                description="Sube PDFs o imagenes de planos directamente al bucket."
                items={workForm.planFiles}
                accept=".pdf,image/*"
                onRemove={(index) =>
                  setWorkForm((current) => ({
                    ...current,
                    planFiles: current.planFiles.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                onUpload={async (files) => {
                  const urls = await uploadMany(
                    files,
                    "plans",
                    workForm.slug || workForm.title || "obra"
                  );
                  if (urls.length > 0) {
                    setWorkForm((current) => ({
                      ...current,
                      planFiles: [...current.planFiles, ...urls],
                    }));
                  }
                }}
              />
            </>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-stone-900">Avances de obra</h3>
              <p className="text-sm leading-6 text-stone-500">
                Cada avance se agrega por separado con fecha, responsable y fotos.
              </p>
            </div>
            {canManageUpdates && (
              <button
                type="button"
                onClick={addEmptyUpdate}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-4 text-sm font-medium text-white"
              >
                <Plus className="h-4 w-4" />
                Agregar avance
              </button>
            )}
          </div>

          {workForm.updates.filter((update) => !update.isDeleted).length > 0 ? (
            <div className="grid gap-4">
              {workForm.updates
                .filter((update) => !update.isDeleted)
                .map((update, index) => (
                <UpdateField
                  key={update.id}
                  update={update}
                  index={index}
                  onChange={(nextUpdate) =>
                    setWorkForm((current) => ({
                      ...current,
                      updates: current.updates.map((item, itemIndex) =>
                        itemIndex === index ? nextUpdate : item
                      ),
                    }))
                  }
                  onRemove={() =>
                    setWorkForm((current) => ({
                      ...current,
                      updates: current.updates.map((item) =>
                        item.id === update.id
                          ? item.id.startsWith("temp-update-")
                            ? { ...item, isDeleted: true }
                            : { ...item, isDeleted: true }
                          : item
                      ),
                    }))
                  }
                  onUploadPhotos={async (files) => {
                    const urls = await uploadMany(
                      files,
                      "works",
                      `${workForm.slug || workForm.title || "obra"}-avance-${index + 1}`
                    );
                    if (urls.length > 0) {
                      setWorkForm((current) => ({
                        ...current,
                        updates: current.updates.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, photos: [...item.photos, ...urls] }
                            : item
                        ),
                      }));
                    }
                  }}
                  onRemovePhoto={(photoIndex) =>
                    setWorkForm((current) => ({
                      ...current,
                      updates: current.updates.map((item) =>
                        item.id === update.id
                          ? {
                              ...item,
                              photos: item.photos.filter(
                                (_, currentPhotoIndex) => currentPhotoIndex !== photoIndex
                              ),
                            }
                          : item
                      ),
                    }))
                  }
                />
              ))}
            </div>
          ) : (
            <CardShell className="px-4 py-8 text-center text-sm text-stone-500">
              Todavia no agregaste avances. Esto es ideal para arquitectos o el encargado de obra.
            </CardShell>
          )}

          <div className="flex flex-wrap justify-between gap-3 border-t border-[#e6d7c2] pt-4">
            {workForm.id && canManageProjectMeta && (
              <button
                type="button"
                onClick={async () => {
                  await deleteWork(workForm.id!);
                  await refreshDashboard();
                  setActiveModal(null);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar obra
              </button>
            )}
            {(canManageProjectMeta || canManageUpdates) && (
              <button
                type="button"
                onClick={saveCurrentWork}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
              >
                <Save className="h-4 w-4" />
                Guardar obra
              </button>
            )}
          </div>
        </div>
      </EditorModal>

      <EditorModal
        open={activeModal === "building"}
        title={buildingForm.id ? "Editar edificio" : "Nuevo edificio"}
        description="Galeria, planos y unidades se organizan dentro de una sola ficha comercial."
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4">
          {!canManageProjectMeta && (
            <div className="rounded-[1.6rem] border border-[#e6d7c2] bg-[#fff9ef] p-4 text-sm leading-6 text-stone-600">
              Este acceso puede revisar la informacion del edificio, pero la edicion comercial y tecnica queda reservada para administracion.
            </div>
          )}

          {canManageProjectMeta ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <InputField label="Titulo" value={buildingForm.title} onChange={(value) => setBuildingForm((current) => ({ ...current, title: value }))} />
                <InputField label="Slug" value={buildingForm.slug} onChange={(value) => setBuildingForm((current) => ({ ...current, slug: value }))} />
                <InputField label="Categoria" value={buildingForm.category} onChange={(value) => setBuildingForm((current) => ({ ...current, category: value }))} />
                <InputField label="Ubicacion" value={buildingForm.location} onChange={(value) => setBuildingForm((current) => ({ ...current, location: value }))} />
                <InputField label="Ano" value={buildingForm.year} onChange={(value) => setBuildingForm((current) => ({ ...current, year: value }))} />
                <InputField label="Area" value={buildingForm.area} onChange={(value) => setBuildingForm((current) => ({ ...current, area: value }))} />
                <SelectField
                  label="Estado"
                  value={buildingForm.status}
                  onChange={(value) =>
                    setBuildingForm((current) => ({ ...current, status: value as ProjectStatus }))
                  }
                  options={projectStatuses.map((status) => ({
                    label: statusLabel(status),
                    value: status,
                  }))}
                />
                <InputField label="Cliente" value={buildingForm.clientName} onChange={(value) => setBuildingForm((current) => ({ ...current, clientName: value }))} />
                <InputField label="Mapa embebido" value={buildingForm.mapEmbedUrl} onChange={(value) => setBuildingForm((current) => ({ ...current, mapEmbedUrl: value }))} />
              </div>

              <TextareaField label="Resumen" value={buildingForm.summary} onChange={(value) => setBuildingForm((current) => ({ ...current, summary: value }))} rows={3} />
              <TextareaField label="Descripcion" value={buildingForm.description} onChange={(value) => setBuildingForm((current) => ({ ...current, description: value }))} rows={5} />
              <MetricsEditor
                title="Metricas"
                description="Agrega unidades, estado, entrega, modalidad o cualquier otra metrica desde un catalogo con buscador."
                metrics={buildingForm.metrics}
                suggestions={metricLibrary}
                onAdd={(label) =>
                  setBuildingForm((current) => ({
                    ...current,
                    metrics: [...current.metrics, { label, value: "" }],
                  }))
                }
                onChange={(index, nextMetric) =>
                  setBuildingForm((current) => ({
                    ...current,
                    metrics: current.metrics.map((metric, metricIndex) =>
                      metricIndex === index ? nextMetric : metric
                    ),
                  }))
                }
                onRemove={(index) =>
                  setBuildingForm((current) => ({
                    ...current,
                    metrics: current.metrics.filter((_, metricIndex) => metricIndex !== index),
                  }))
                }
              />
              <AmenityEditor
                amenities={buildingForm.amenities}
                suggestions={amenityLibrary}
                onAdd={(value) =>
                  setBuildingForm((current) => ({
                    ...current,
                    amenities: [...current.amenities, value],
                  }))
                }
                onRemove={(index) =>
                  setBuildingForm((current) => ({
                    ...current,
                    amenities: current.amenities.filter(
                      (_, amenityIndex) => amenityIndex !== index
                    ),
                  }))
                }
              />
              <AssignmentSelector
                title="Arquitectos responsables"
                description="Selecciona uno o varios responsables para que luego puedan ver este edificio en su panel."
                options={assignableStaff}
                selectedIds={buildingForm.assignedStaffIds}
                onToggle={(userId, checked) =>
                  setBuildingForm((current) => ({
                    ...current,
                    assignedStaffIds: checked
                      ? [...current.assignedStaffIds, userId]
                      : current.assignedStaffIds.filter((id) => id !== userId),
                  }))
                }
              />

              <CardShell className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">Unidades o departamentos</h3>
                    <p className="text-sm leading-6 text-stone-500">
                      Agrega cada departamento con su configuracion, piso, precio y disponibilidad desde una ficha clara.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openUnitEditor()}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-stone-900 px-4 text-sm font-medium text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar unidad
                  </button>
                </div>

                {buildingForm.units.length > 0 ? (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    {buildingForm.units.map((unit, index) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        onEdit={() => openUnitEditor(index)}
                        onDelete={() =>
                          setBuildingForm((current) => ({
                            ...current,
                            units: current.units.filter((_, itemIndex) => itemIndex !== index),
                          }))
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-8 text-center text-sm text-stone-500">
                    Todavia no hay unidades cargadas.
                  </div>
                )}
              </CardShell>

              <CardShell className="p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">Portada principal</h3>
                    <p className="text-sm leading-6 text-stone-500">
                      Imagen principal del edificio.
                    </p>
                  </div>
                  <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black">
                    <Upload className="h-4 w-4" />
                    Subir portada
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (event) => {
                        const [url] = await uploadMany(
                          event.target.files,
                          "buildings",
                          buildingForm.slug || buildingForm.title || "edificio"
                        );
                        if (url) {
                          setBuildingForm((current) => ({ ...current, heroImage: url }));
                        }
                      }}
                    />
                  </label>
                </div>
                {buildingForm.heroImage ? (
                  <img
                    src={buildingForm.heroImage}
                    alt={buildingForm.title || "Portada"}
                    className="mt-4 h-56 w-full rounded-[1.4rem] object-cover"
                  />
                ) : (
                  <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-10 text-center text-sm text-stone-500">
                    Todavia no hay portada cargada.
                  </div>
                )}
              </CardShell>

              <MediaField
                title="Galeria"
                description="Fotos y renders del edificio."
                items={buildingForm.gallery}
                accept="image/*"
                onRemove={(index) =>
                  setBuildingForm((current) => ({
                    ...current,
                    gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                onUpload={async (files) => {
                  const urls = await uploadMany(
                    files,
                    "buildings",
                    buildingForm.slug || buildingForm.title || "edificio"
                  );
                  if (urls.length > 0) {
                    setBuildingForm((current) => ({
                      ...current,
                      gallery: [...current.gallery, ...urls],
                    }));
                  }
                }}
              />

              <MediaField
                title="Planos"
                description="PDFs o imagenes de departamentos, plantas y cortes."
                items={buildingForm.planFiles}
                accept=".pdf,image/*"
                onRemove={(index) =>
                  setBuildingForm((current) => ({
                    ...current,
                    planFiles: current.planFiles.filter((_, itemIndex) => itemIndex !== index),
                  }))
                }
                onUpload={async (files) => {
                  const urls = await uploadMany(
                    files,
                    "plans",
                    buildingForm.slug || buildingForm.title || "edificio"
                  );
                  if (urls.length > 0) {
                    setBuildingForm((current) => ({
                      ...current,
                      planFiles: [...current.planFiles, ...urls],
                    }));
                  }
                }}
              />

              <div className="flex flex-wrap justify-between gap-3 border-t border-[#e6d7c2] pt-4">
                {buildingForm.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteBuilding(buildingForm.id!);
                      await refreshDashboard();
                      setActiveModal(null);
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar edificio
                  </button>
                )}
                <button
                  type="button"
                  onClick={saveCurrentBuilding}
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
                >
                  <Save className="h-4 w-4" />
                  Guardar edificio
                </button>
              </div>
            </>
          ) : (
            <CardShell className="overflow-hidden p-0">
              {buildingForm.heroImage && (
                <img
                  src={buildingForm.heroImage}
                  alt={buildingForm.title}
                  className="h-56 w-full object-cover"
                />
              )}
              <div className="grid gap-4 p-5">
                <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                  <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-[#9a7317]">
                    {statusLabel(buildingForm.status)}
                  </span>
                  <span>{buildingForm.location}</span>
                  <span>{buildingForm.area}</span>
                </div>
                <p className="text-base leading-7 text-stone-700">{buildingForm.summary}</p>
                <p className="text-sm leading-7 text-stone-500">{buildingForm.description}</p>
                {buildingForm.units.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {buildingForm.units.map((unit) => (
                      <UnitCard
                        key={unit.id}
                        unit={unit}
                        onEdit={() => undefined}
                        onDelete={() => undefined}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </CardShell>
          )}
        </div>
      </EditorModal>

      <EditorModal
        open={unitModalOpen}
        title={editingUnitIndex === null ? "Nueva unidad" : "Editar unidad"}
        description="Configura cada departamento con habitaciones, banos, piso, precio y disponibilidad."
        onClose={() => setUnitModalOpen(false)}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <InputField
              label="Nombre de la unidad"
              value={unitForm.title}
              onChange={(value) => setUnitForm((current) => ({ ...current, title: value }))}
              placeholder="Departamento 2H"
            />
            <InputField
              label="Area"
              value={unitForm.area}
              onChange={(value) => setUnitForm((current) => ({ ...current, area: value }))}
              placeholder="84 m2"
            />
            <InputField
              label="Habitaciones"
              value={String(unitForm.bedrooms)}
              onChange={(value) =>
                setUnitForm((current) => ({
                  ...current,
                  bedrooms: Number(value) || 0,
                }))
              }
              type="number"
            />
            <InputField
              label="Banos"
              value={String(unitForm.bathrooms)}
              onChange={(value) =>
                setUnitForm((current) => ({
                  ...current,
                  bathrooms: Number(value) || 0,
                }))
              }
              type="number"
            />
            <InputField
              label="Piso o ubicacion"
              value={unitForm.floorLabel}
              onChange={(value) =>
                setUnitForm((current) => ({ ...current, floorLabel: value }))
              }
              placeholder="Pisos 4 y 5"
            />
            <InputField
              label="Precio"
              value={unitForm.price}
              onChange={(value) => setUnitForm((current) => ({ ...current, price: value }))}
              placeholder="USD 89.000"
            />
            <SelectField
              label="Disponibilidad"
              value={unitForm.isAvailable ? "si" : "no"}
              onChange={(value) =>
                setUnitForm((current) => ({
                  ...current,
                  isAvailable: value === "si",
                }))
              }
              options={[
                { label: "Disponible", value: "si" },
                { label: "No disponible", value: "no" },
              ]}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#e6d7c2] pt-4">
            <button
              type="button"
              onClick={() => setUnitModalOpen(false)}
              className="inline-flex h-11 items-center rounded-full border border-stone-200 bg-white px-4 text-sm text-stone-700"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                const nextUnit: BuildingUnit = {
                  ...unitForm,
                  price: unitForm.price || undefined,
                };

                setBuildingForm((current) => ({
                  ...current,
                  units:
                    editingUnitIndex === null
                      ? [...current.units, nextUnit]
                      : current.units.map((unit, index) =>
                          index === editingUnitIndex ? nextUnit : unit
                        ),
                }));
                setUnitModalOpen(false);
              }}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
            >
              <Save className="h-4 w-4" />
              Guardar unidad
            </button>
          </div>
        </div>
      </EditorModal>

      <EditorModal
        open={activeModal === "team"}
        title={teamForm.id ? "Editar perfil" : "Nuevo perfil"}
        description="Edita el equipo desde una ficha ligera y mas alineada al sitio."
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <InputField label="Nombre" value={teamForm.name} onChange={(value) => setTeamForm((current) => ({ ...current, name: value }))} />
            <InputField label="Cargo" value={teamForm.role} onChange={(value) => setTeamForm((current) => ({ ...current, role: value }))} />
          </div>
          <TextareaField label="Bio" value={teamForm.bio} onChange={(value) => setTeamForm((current) => ({ ...current, bio: value }))} rows={6} />

          <CardShell className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-stone-900">Foto del perfil</h3>
                <p className="text-sm leading-6 text-stone-500">
                  Sube una imagen del responsable.
                </p>
              </div>
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#FFDC63] px-4 text-sm font-medium text-black">
                <Upload className="h-4 w-4" />
                Subir foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const [url] = await uploadMany(
                      event.target.files,
                      "team",
                      teamForm.name || teamForm.role || "equipo"
                    );
                    if (url) {
                      setTeamForm((current) => ({ ...current, image: url }));
                    }
                  }}
                />
              </label>
            </div>
            {teamForm.image ? (
              <img
                src={teamForm.image}
                alt={teamForm.name || "Perfil"}
                className="mt-4 h-64 w-full rounded-[1.4rem] object-cover"
              />
            ) : (
              <div className="mt-4 rounded-[1.4rem] border border-dashed border-stone-300 bg-[#fcfaf6] px-4 py-10 text-center text-sm text-stone-500">
                Todavia no hay imagen cargada.
              </div>
            )}
          </CardShell>

          <div className="flex flex-wrap justify-between gap-3 border-t border-[#e6d7c2] pt-4">
            {teamForm.id && (
              <button
                type="button"
                onClick={async () => {
                  await deleteTeamMember(teamForm.id!);
                  await refreshDashboard();
                  setActiveModal(null);
                }}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-600"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar perfil
              </button>
            )}
            <button
              type="button"
              onClick={saveCurrentTeam}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black"
            >
              <Save className="h-4 w-4" />
              Guardar perfil
            </button>
          </div>
        </div>
      </EditorModal>

      <EditorModal
        open={activeModal === "staff"}
        title="Acceso CMS y asignaciones"
        description="Asigna el rol del usuario y define en que obras o edificios podra trabajar dentro del CMS."
        onClose={() => setActiveModal(null)}
      >
        <div className="grid gap-5">
          <div className="rounded-[1.6rem] border border-[#e6d7c2] bg-[#fff9ef] p-4 text-sm leading-6 text-stone-600">
            El usuario primero debe crear su cuenta desde la pantalla de acceso. Luego aqui puedes convertirlo en arquitecto, encargado de obra, ventas o administrador y asignarle proyectos.
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InputField
              label="Nombre completo"
              value={staffForm.fullName}
              onChange={(value) =>
                setStaffForm((current) => ({ ...current, fullName: value }))
              }
            />
            <InputField
              label="Correo"
              value={staffForm.email}
              onChange={(value) =>
                setStaffForm((current) => ({ ...current, email: value }))
              }
            />
            <InputField
              label="ID de usuario"
              value={staffForm.userId}
              onChange={(value) =>
                setStaffForm((current) => ({ ...current, userId: value }))
              }
              placeholder="UUID de auth.users"
            />
            <SelectField
              label="Rol"
              value={staffForm.role}
              onChange={(value) =>
                setStaffForm((current) => ({
                  ...current,
                  role: value as CmsUserRole,
                }))
              }
              options={[
                { label: "Administrador", value: "admin" },
                { label: "Arquitecto", value: "architect" },
                { label: "Encargado de obra", value: "site_manager" },
                { label: "Ventas", value: "sales" },
              ]}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <CardShell className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">Obras asignadas</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Un arquitecto o encargado solo vera estas obras y podra subir avances segun su rol.
                  </p>
                </div>
                <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-xs font-medium text-[#9a7317]">
                  {staffForm.assignedWorkIds.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {dashboard.works.map((work) => {
                  const checked = staffForm.assignedWorkIds.includes(work.id);
                  return (
                    <label
                      key={work.id}
                      className="flex items-start gap-3 rounded-[1.3rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setStaffForm((current) => ({
                            ...current,
                            assignedWorkIds: event.target.checked
                              ? [...current.assignedWorkIds, work.id]
                              : current.assignedWorkIds.filter((id) => id !== work.id),
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-[#b88b16] focus:ring-[#b88b16]"
                      />
                      <span>
                        <strong className="block text-stone-900">{work.title}</strong>
                        <span className="text-stone-500">{work.location}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </CardShell>

            <CardShell className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">Edificios asignados</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Sirve para limitar lo que el usuario vera en proyectos verticales o comerciales.
                  </p>
                </div>
                <span className="rounded-full bg-[#fff4d4] px-3 py-1 text-xs font-medium text-[#9a7317]">
                  {staffForm.assignedBuildingIds.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {dashboard.buildings.map((building) => {
                  const checked = staffForm.assignedBuildingIds.includes(building.id);
                  return (
                    <label
                      key={building.id}
                      className="flex items-start gap-3 rounded-[1.3rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) =>
                          setStaffForm((current) => ({
                            ...current,
                            assignedBuildingIds: event.target.checked
                              ? [...current.assignedBuildingIds, building.id]
                              : current.assignedBuildingIds.filter((id) => id !== building.id),
                          }))
                        }
                        className="mt-1 h-4 w-4 rounded border-stone-300 text-[#b88b16] focus:ring-[#b88b16]"
                      />
                      <span>
                        <strong className="block text-stone-900">{building.title}</strong>
                        <span className="text-stone-500">{building.location}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </CardShell>
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#e6d7c2] pt-4">
            <button
              type="button"
              onClick={saveCurrentStaff}
              disabled={!staffForm.userId.trim()}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#FFDC63] px-5 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Guardar acceso
            </button>
          </div>
        </div>
      </EditorModal>
    </div>
  );
}
