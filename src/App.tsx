import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  ClipboardList,
  Layers3,
  MapPin,
  Menu,
  MessageSquare,
  Phone,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import { fallbackContent } from "./data/fallback-content";
import { createLead, loadSiteContent } from "./lib/content";
import type {
  BuildingProject,
  FaqItem,
  LeadPayload,
  ServiceItem,
  SiteContent,
  TeamMember,
  TestimonialItem,
  WorkProject,
} from "./types/cms";

type LenisInstance = {
  raf: (time: number) => void;
  destroy?: () => void;
};

type GsapApi = {
  registerPlugin: (plugin: unknown) => void;
  fromTo: (
    target: string | Element,
    fromVars: Record<string, unknown>,
    toVars: Record<string, unknown>
  ) => void;
};

type GsapModule = {
  gsap?: GsapApi;
  default?: GsapApi;
};

type ScrollTriggerModule = {
  ScrollTrigger?: unknown;
  default?: unknown;
};

type DetailState =
  | { kind: "work"; item: WorkProject }
  | { kind: "building"; item: BuildingProject }
  | null;

type RouteState =
  | { kind: "home" }
  | { kind: "work"; slug: string }
  | { kind: "building"; slug: string };

type LeadFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  message: string;
};

const boliviaCities = [
  "La Paz",
  "Santa Cruz",
  "Cochabamba",
  "Sucre",
  "Oruro",
  "Potosi",
  "Tarija",
  "Beni",
  "Pando",
] as const;

const processSteps = [
  ["01", "Planificacion", "Estudiamos el alcance del proyecto, el presupuesto y la estrategia constructiva."],
  ["02", "Ejecucion", "Desarrollamos la obra con control tecnico, coordinacion en campo y seguimiento continuo."],
  ["03", "Supervision", "Cuidamos calidad, tiempos, avances y resolucion de detalles durante cada etapa."],
  ["04", "Entrega", "Cerramos con orden, documentacion y acompanamiento para la puesta en marcha del proyecto."],
] as const;

function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "dark";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}) {
  const variants = {
    primary:
      "bg-[#FFDC63] text-black hover:bg-[#FFE58A] shadow-lg shadow-[#FFDC63]/10",
    outline:
      "border border-white/15 bg-white/5 text-stone-100 hover:bg-white/10 hover:text-white",
    dark: "bg-black text-white hover:bg-black/85",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex h-[52px] items-center justify-center rounded-full px-6 text-base font-medium whitespace-nowrap transition sm:px-7 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function statusLabel(status: string) {
  if (status === "en_progreso") return "En progreso";
  if (status === "finalizado") return "Finalizado";
  return "Planificacion";
}

function interestTypeLabel(
  interestType: LeadPayload["interestType"],
  unitLabel?: string
) {
  if (interestType === "departamento") {
    return unitLabel ? `Consulta por ${unitLabel}` : "Consulta por departamento";
  }

  if (interestType === "edificio") return "Consulta por edificio";
  if (interestType === "obra") return "Consulta por obra";
  return "Consulta general";
}

function fileLabel(source: string) {
  try {
    const pathname = new URL(source).pathname;
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    return lastSegment ? decodeURIComponent(lastSegment) : source;
  } catch {
    return source;
  }
}

function parseRoute(): RouteState {
  const segments = window.location.pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean);

  if (segments[0] === "obras" && segments[1]) {
    return { kind: "work", slug: segments[1] };
  }

  if (segments[0] === "edificios" && segments[1]) {
    return { kind: "building", slug: segments[1] };
  }

  return { kind: "home" };
}

function buildRoute(kind: "work" | "building", slug: string) {
  return kind === "work" ? `/obras/${slug}` : `/edificios/${slug}`;
}

function detectAppleMobileSafari() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent;
  const isAppleMobileDevice =
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafariBrowser =
    /Safari/i.test(userAgent) &&
    !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/i.test(userAgent);

  return isAppleMobileDevice && isSafariBrowser;
}

function StatusPill({
  children,
  tone = "dark",
}: {
  children: React.ReactNode;
  tone?: "dark" | "light" | "brand";
}) {
  const tones = {
    dark: "border-white/12 bg-white/[0.06] text-stone-200",
    light: "border-black/10 bg-black/10 text-black/75",
    brand: "border-[#FFDC63]/30 bg-[#FFDC63]/18 text-[#FFDC63]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function BrandLockup({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`flex min-w-0 items-center ${className}`}>
      <img
        src="/logo/logo.png"
        alt="Logo Mondoza"
        className="h-auto w-[50px] object-contain sm:w-[70px]"
      />
    </span>
  );
}

function HeroSection({
  companyName,
  heroEyebrow,
  heroTitle,
  heroAccent,
  heroDescription,
  heroImage,
  tagline,
  location,
  onOpenCatalog,
  onOpenContact,
}: {
  companyName: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  tagline: string;
  location: string;
  onOpenCatalog: () => void;
  onOpenContact: () => void;
}) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden sm:min-h-screen">
      <img
        src={heroImage}
        alt={companyName}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,7,5,0.14)_0%,rgba(9,7,5,0.3)_28%,rgba(9,7,5,0.64)_68%,rgba(9,7,5,0.9)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,255,255,0.16),transparent_24%),radial-gradient(circle_at_84%_68%,rgba(255,220,99,0.22),transparent_22%)]" />

      <div className="absolute left-4 right-4 top-24 max-w-xs rounded-[1.35rem] border border-white/15 bg-black/20 px-4 py-2.5 text-xs leading-5 text-stone-100 backdrop-blur-xl sm:left-8 sm:max-w-sm sm:px-5 sm:py-4 sm:text-sm sm:leading-6 md:left-12 md:top-28">
        {tagline}
      </div>

      <div className="absolute bottom-32 left-4 right-4 sm:bottom-32 sm:left-8 sm:right-8 md:bottom-20 md:left-12 md:max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#FFDC63] sm:text-sm">
          {heroEyebrow}
        </p>
        <h1 className="mt-4 text-[3.35rem] font-semibold leading-[0.9] tracking-[-0.08em] text-white sm:text-7xl md:text-8xl lg:text-[8rem]">
          {heroTitle}
          <span className="block [font-family:Georgia,serif] text-[0.86em] italic font-normal tracking-[-0.06em] text-[#f7efe4]">
            {heroAccent}
          </span>
        </h1>
        <p className="mt-4 max-w-xl text-[13px] leading-6 text-stone-200 sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-8 md:text-lg">
          {heroDescription}
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
          <Button className="w-full sm:w-auto" onClick={onOpenCatalog}>
            Ver catalogo
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onOpenContact}
          >
            Solicitar cotizacion
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-white/15 bg-black/30 p-3.5 backdrop-blur-2xl sm:left-auto sm:right-8 sm:bottom-8 sm:w-[360px] sm:rounded-[1.8rem] sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.26em] text-[#FFDC63]">
          Cobertura
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white sm:mt-3 sm:text-2xl">
          {location}
        </h2>
        <p className="mt-2 hidden text-sm leading-6 text-stone-300 sm:block">
          Atendemos proyectos residenciales, comerciales y de edificacion con seguimiento tecnico y presencia de obra.
        </p>
      </div>
    </div>
  );
}

function ResponsiveCopy({
  mobile,
  desktop,
}: {
  mobile: string;
  desktop: string;
}) {
  return (
    <>
      <span className="sm:hidden">{mobile}</span>
      <span className="hidden sm:inline">{desktop}</span>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : ""}>
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#FFDC63] sm:text-sm sm:tracking-[0.32em]">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-[1.95rem] font-semibold leading-[1.02] tracking-[-0.05em] sm:mt-4 sm:text-4xl md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-xl text-sm leading-6 text-stone-400 sm:mt-5 sm:max-w-2xl sm:text-base sm:leading-7">
          {description}
        </p>
      )}
    </div>
  );
}

function CatalogCard({
  title,
  subtitle,
  image,
  detail,
  onClick,
  badge,
}: {
  title: string;
  subtitle: string;
  image: string;
  detail: string;
  onClick: () => void;
  badge: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative h-[300px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 text-left shadow-xl shadow-black/20 sm:h-[340px] sm:rounded-[2rem]"
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
      <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-xl">
          {badge}
        </span>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-xl transition group-hover:bg-[#FFDC63] group-hover:text-black">
          <ArrowUpRight className="h-5 w-5" />
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#FFDC63] sm:text-sm sm:tracking-[0.28em]">
          {subtitle}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] sm:mt-3 sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 text-sm text-stone-300">{detail}</p>
      </div>
    </motion.button>
  );
}

function ServiceCard({ service }: { service: ServiceItem }) {
  const serviceIcons = [Building2, Layers3, ClipboardList, ShieldCheck];
  const Icon = serviceIcons[Math.abs(service.id.length) % serviceIcons.length];

  return (
    <div className="gsap-reveal rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-4 text-stone-100 shadow-xl shadow-black/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
      <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-[#FFDC63]/15 text-[#FFDC63] sm:mb-8 sm:h-[52px] sm:w-[52px]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold sm:text-xl">{service.title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-400 sm:mt-4 sm:text-base sm:leading-7">
        {service.text}
      </p>
    </div>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="gsap-reveal overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.045] shadow-xl shadow-black/20 backdrop-blur-xl sm:rounded-[2rem]">
      <img
        src={member.image}
        alt={member.name}
        loading="lazy"
        decoding="async"
        className="h-56 w-full object-cover sm:h-72"
      />
      <div className="p-4 sm:p-6">
        <p className="text-[11px] uppercase tracking-[0.24em] text-[#FFDC63]">
          {member.role}
        </p>
        <h3 className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">{member.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-400 sm:mt-4 sm:line-clamp-none sm:text-base sm:leading-7">
          {member.bio}
        </p>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-10 items-center rounded-full border px-4 text-sm transition ${
        active
          ? "border-[#FFDC63]/35 bg-[#FFDC63] text-black"
          : "border-white/10 bg-white/[0.05] text-stone-300 hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ProjectSearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="relative w-full sm:max-w-sm">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-white/10 bg-white/[0.05] pl-10 pr-4 text-sm text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
      />
    </label>
  );
}

function TestimonialCard({ item }: { item: TestimonialItem }) {
  return (
    <div className="gsap-reveal rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5 shadow-xl shadow-black/20 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
      <p className="text-base leading-7 text-stone-200 sm:text-lg sm:leading-8">
        "{item.quote}"
      </p>
      <div className="mt-5 border-t border-white/10 pt-4">
        <p className="font-semibold text-white">{item.name}</p>
        <p className="mt-1 text-sm text-stone-400">
          {item.role}
          {item.company ? ` · ${item.company}` : ""}
        </p>
      </div>
    </div>
  );
}

function FaqCard({
  item,
  open,
  onToggle,
}: {
  item: FaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/15 backdrop-blur-xl">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="text-base font-semibold text-white sm:text-lg">{item.question}</span>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition ${
            open
              ? "border-[#FFDC63]/35 bg-[#FFDC63] text-black"
              : "border-white/10 bg-white/[0.05] text-stone-300"
          }`}
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <p className="text-sm leading-6 text-stone-400 sm:text-base sm:leading-7">
            {item.answer}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function QuoteFloatingButton({
  onClick,
  hidden = false,
}: {
  onClick: () => void;
  hidden?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed bottom-5 right-5 z-[60] inline-flex h-14 items-center justify-center rounded-full bg-[#FFDC63] px-5 text-sm font-semibold text-black shadow-2xl shadow-black/30 transition hover:scale-[1.02] sm:bottom-7 sm:right-7 sm:px-6 sm:text-base ${
        hidden ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      Pedir cotizacion
      <ArrowUpRight className="ml-2 h-4 w-4" />
    </button>
  );
}

function QuoteModal({
  open,
  onClose,
  form,
  onChange,
  onSubmit,
  loading,
  success,
  error,
  successMessage,
  contextLabel,
  isAppleMobileSafari,
}: {
  open: boolean;
  onClose: () => void;
  form: LeadFormState;
  onChange: (field: keyof LeadFormState, value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  success: boolean;
  error: boolean;
  successMessage: string;
  contextLabel: string;
  isAppleMobileSafari: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-3 sm:items-center sm:p-6 ${
            isAppleMobileSafari ? "" : "backdrop-blur-sm"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{
              duration: isAppleMobileSafari ? 0.18 : 0.28,
              ease: "easeOut",
            }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-[calc(100dvh-0.75rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.85rem] border border-white/10 bg-[#11100d] text-stone-100 shadow-2xl shadow-black/35 sm:max-h-[90vh] sm:rounded-[2rem]"
          >
            {loading ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="rounded-[1.8rem] border border-white/10 bg-black/55 px-7 py-7 text-center">
                  <img
                    src="/logo/logo.png"
                    alt="Logo Mondoza"
                    className="mx-auto h-auto w-[88px] object-contain"
                  />
                  <p className="mt-4 text-xs uppercase tracking-[0.28em] text-[#FFDC63]">
                    Construyendo tus suenos
                  </p>
                  <div className="mt-4 inline-flex items-center gap-3 text-sm text-stone-200">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FFDC63] border-t-transparent" />
                    Enviando solicitud
                  </div>
                </div>
              </div>
            ) : null}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#11100d]/95 px-4 py-4 backdrop-blur sm:px-6">
              <BrandLockup className="justify-start" />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal de cotizacion"
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.06]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="overflow-y-auto px-5 py-10 text-center sm:px-10 sm:py-16">
                <div className="mx-auto flex justify-center">
                  <img
                    src="/logo/logo.png"
                    alt="Logo Mondoza"
                    className="h-auto w-[190px] object-contain sm:w-[236px]"
                  />
                </div>
                <h3 className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-white">
                  Gracias por contactar con Construcciones Mondoza
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-stone-300">
                  {successMessage || "Nos pondremos en contacto lo mas antes posible para ayudarte con tu proyecto."}
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 inline-flex h-[52px] items-center justify-center rounded-full bg-[#FFDC63] px-6 text-base font-medium text-black"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className="overflow-y-auto px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
                <div>
                  <StatusPill tone="brand">{contextLabel}</StatusPill>
                  <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
                    Solicita una cotizacion
                  </h3>
                  <p className="mt-4 leading-7 text-stone-300">
                    Comparte tus datos, ciudad y lo que necesitas. Nuestro equipo revisara tu solicitud y te contactara a la brevedad.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={form.firstName}
                      onChange={(event) => onChange("firstName", event.target.value)}
                      placeholder="Nombre"
                      className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
                      required
                    />
                    <input
                      value={form.lastName}
                      onChange={(event) => onChange("lastName", event.target.value)}
                      placeholder="Apellido"
                      className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={form.phone}
                      onChange={(event) => onChange("phone", event.target.value)}
                      placeholder="Numero o WhatsApp"
                      className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
                      required
                    />
                    <select
                      value={form.city}
                      onChange={(event) => onChange("city", event.target.value)}
                      className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-4 text-white outline-none focus:border-[#FFDC63]/35"
                      required
                    >
                      <option value="">Selecciona tu ciudad</option>
                      {boliviaCities.map((city) => (
                        <option key={city} value={city} className="text-black">
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    value={form.email}
                    onChange={(event) => onChange("email", event.target.value)}
                    placeholder="Correo electronico"
                    type="email"
                    className="h-12 rounded-full border border-white/10 bg-white/[0.06] px-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
                    required
                  />

                  <textarea
                    value={form.message}
                    onChange={(event) => onChange("message", event.target.value)}
                    placeholder="Cuéntanos sobre tu obra, edificio, unidad o requerimiento"
                    className="min-h-36 rounded-[1.5rem] border border-white/10 bg-white/[0.06] px-4 py-4 text-white outline-none placeholder:text-stone-500 focus:border-[#FFDC63]/35"
                    required
                  />

                  <button
                    type="submit"
                    className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#FFDC63] px-6 text-base font-medium text-black"
                  >
                    {loading ? "Enviando..." : "Enviar solicitud"}
                  </button>
                  {successMessage ? (
                    <p
                      className={`text-sm leading-6 ${
                        error ? "text-rose-300" : "text-emerald-300"
                      }`}
                    >
                      {successMessage}
                    </p>
                  ) : null}
                </form>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({
  open,
  onClose,
  links,
  actionLabel,
  actionHref,
  actionOnClick,
  isAppleMobileSafari,
}: {
  open: boolean;
  onClose: () => void;
  links: { label: string; href: string; onClick?: () => void }[];
  actionLabel: string;
  actionHref: string;
  actionOnClick?: () => void;
  isAppleMobileSafari: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{
            duration: isAppleMobileSafari ? 0.16 : 0.24,
            ease: isAppleMobileSafari ? "easeOut" : [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[70] overflow-hidden bg-[#0d0c0a] text-stone-100 md:hidden"
        >
          <div className="flex h-full flex-col px-6 pb-8 pt-6">
            <div className="mb-10 flex items-center justify-between">
              <BrandLockup className="justify-start" />
              <button
                type="button"
                onClick={onClose}
                className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[0.06]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="space-y-2">
                {links.map((link, index) => (
                  <motion.a
                    key={`${link.label}-${index}`}
                    href={link.href}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: isAppleMobileSafari ? 0.16 : 0.24,
                      delay: isAppleMobileSafari ? index * 0.03 : index * 0.05,
                    }}
                    onClick={(event) => {
                      link.onClick?.();
                      if (link.href.startsWith("#")) {
                        event.preventDefault();
                        document.querySelector(link.href)?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                      onClose();
                    }}
                    className="block border-b border-white/10 py-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </div>

              <motion.a
                href={actionHref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: isAppleMobileSafari ? 0.16 : 0.24,
                  delay: isAppleMobileSafari ? 0.08 : 0.12,
                }}
                onClick={(event) => {
                  if (actionOnClick) {
                    event.preventDefault();
                    actionOnClick();
                  } else if (actionHref.startsWith("#")) {
                    event.preventDefault();
                    document.querySelector(actionHref)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                  onClose();
                }}
                className="mt-10 inline-flex h-[54px] items-center justify-center rounded-full bg-[#FFDC63] px-6 text-base font-medium text-black"
              >
                {actionLabel}
              </motion.a>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function DetailViewScreen({
  detail,
  activeImage,
  onImageSelect,
  onBack,
  onLeadIntent,
}: {
  detail: DetailState;
  activeImage: string;
  onImageSelect: (image: string) => void;
  onBack: () => void;
  onLeadIntent: (interestType: LeadPayload["interestType"], slug?: string, unitLabel?: string) => void;
}) {
  if (!detail) {
    return null;
  }

  const item = detail.item;
  const isBuilding = detail.kind === "building";
  const [unitFilter, setUnitFilter] = useState<"all" | "available" | "2h" | "3h">("all");

  useEffect(() => {
    setUnitFilter("all");
  }, [detail.kind, item.slug]);

  const visibleUnits =
    detail.kind === "building"
      ? detail.item.units.filter((unit) => {
          if (unitFilter === "available") return unit.isAvailable;
          if (unitFilter === "2h") return unit.bedrooms <= 2;
          if (unitFilter === "3h") return unit.bedrooms >= 3;
          return true;
        })
      : [];

  return (
    <motion.div
      key={`${detail.kind}-${item.slug}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <section id="detalle-hero" className="relative min-h-[88svh] overflow-hidden sm:min-h-screen">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={item.title}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0.42)_30%,rgba(0,0,0,0.84)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl flex-col justify-end px-5 pb-8 pt-28 sm:min-h-screen sm:pb-10 md:px-8 md:pb-16">
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-stone-100 backdrop-blur-xl transition hover:border-[#FFDC63]/35 hover:text-[#FFDC63]"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catalogo
          </button>

          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#FFDC63] sm:text-sm">
              {item.category}
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl md:text-7xl lg:text-8xl">
              {item.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-200 sm:mt-5 sm:text-lg sm:leading-8 md:text-xl">
              {item.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-7 sm:gap-3">
              <StatusPill tone="brand">{statusLabel(item.status)}</StatusPill>
              <StatusPill>{item.year}</StatusPill>
              <StatusPill>{item.area}</StatusPill>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-200">
                <MapPin className="h-3.5 w-3.5 text-[#FFDC63]" />
                {item.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="detalle-resumen" className="px-5 py-10 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div>
            <SectionHeading
              eyebrow="Resumen"
              title="Informacion esencial del proyecto en una sola vista."
              description={
                <ResponsiveCopy
                  mobile="Ubicacion, estado, datos clave y material visual."
                  desktop="Reunimos ubicacion, estado, datos tecnicos, planos y material visual para presentar cada proyecto con claridad."
                />
              }
            />
          </div>

          <div>
            <p className="text-sm leading-6 text-stone-300 sm:text-lg sm:leading-8">
              {item.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6 sm:gap-3">
              <StatusPill tone="brand">{statusLabel(item.status)}</StatusPill>
              <StatusPill>{item.clientName}</StatusPill>
              <StatusPill>{item.ownerName}</StatusPill>
            </div>

            {item.brochureFile && (
              <div className="mt-5 sm:mt-6">
                <a
                  href={item.brochureFile}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-full border border-[#FFDC63]/30 bg-[#FFDC63]/12 px-4 py-2 text-sm font-medium text-[#FFDC63] transition hover:bg-[#FFDC63]/18"
                >
                  Ver ficha del proyecto
                </a>
              </div>
            )}

            <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
              {item.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[1.6rem] sm:p-5"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-stone-100 sm:mt-3 sm:text-xl">
                    {metric.value}
                  </p>
                </div>
              ))}
              <div className="hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:block">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  Cliente
                </p>
                <p className="mt-3 text-xl font-semibold text-stone-100">
                  {item.clientName}
                </p>
              </div>
              <div className="hidden rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:block">
                <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                  Responsable
                </p>
                <p className="mt-3 text-xl font-semibold text-stone-100">
                  {item.ownerName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="detalle-galeria" className="px-5 pb-10 md:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between md:gap-5">
            <SectionHeading
              eyebrow="Galeria"
              title="Elige la vista y subela al espacio principal."
              description={
                <ResponsiveCopy
                  mobile="Elige una vista y revisa el proyecto rapido."
                  desktop="Recorre el proyecto desde distintas vistas y revisa el material visual mas importante."
                />
              }
            />
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() =>
                onLeadIntent(isBuilding ? "edificio" : "obra", item.slug)
              }
            >
              Solicitar informacion
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
            <div
              id="detalle-media-top"
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${item.slug}-${activeImage}`}
                  src={activeImage}
                  alt={item.title}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="h-[260px] w-full object-cover sm:h-[480px] md:h-[620px]"
                />
              </AnimatePresence>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-1">
              {item.gallery.map((image, index) => (
                <button
                  key={`${item.slug}-thumb-${index}`}
                  type="button"
                  onClick={() => onImageSelect(image)}
                  className={`group relative w-[210px] shrink-0 overflow-hidden rounded-[1.5rem] border text-left transition sm:w-auto sm:rounded-[1.8rem] ${
                    image === activeImage
                      ? "border-[#FFDC63]/45"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${item.title} vista ${index + 1}`}
                    className="h-32 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-40 md:h-[194px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-stone-200">
                      Vista {index + 1}
                    </span>
                    {image === activeImage && (
                      <span className="rounded-full bg-[#FFDC63] px-3 py-1 text-xs font-medium text-black">
                        Activa
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {detail.kind === "work" ? (
        <section id="detalle-avances" className="px-5 pb-10 md:px-8 md:pb-24">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <SectionHeading
                eyebrow="Avances y planos"
                title="Seguimiento de obra y documentacion tecnica."
                description={
                  <ResponsiveCopy
                    mobile="Consulta hitos, fotos y planos."
                    desktop="Consulta hitos de avance, registros fotograficos y planos vinculados a cada proyecto."
                  />
                }
              />
            </div>

            <div className="space-y-4">
              {detail.item.updates.map((update) => (
                <div
                  key={update.id}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[1.6rem] sm:p-5"
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[#FFDC63]">
                    {update.date}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold sm:text-2xl">{update.title}</h3>
                  {update.performedBy && (
                    <p className="mt-2 text-sm text-stone-400">
                      Realizado por {update.performedBy}
                    </p>
                  )}
                  <p className="mt-3 leading-7 text-stone-400">{update.summary}</p>
                  {update.photos.length > 0 && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {update.photos.map((photo, index) => (
                        <img
                          key={`${update.id}-photo-${index}`}
                          src={photo}
                          alt={`${update.title} foto ${index + 1}`}
                          className="h-36 w-full rounded-[1.2rem] object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[1.6rem] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-[#FFDC63]">
                    Planos disponibles
                  </p>
                  {detail.item.brochureFile && (
                    <a
                      href={detail.item.brochureFile}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#FFDC63]/30 bg-[#FFDC63]/12 px-4 py-2 text-sm font-medium text-[#FFDC63]"
                    >
                      Abrir ficha
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {detail.item.planFiles.map((plan) => (
                    <a
                      key={plan}
                      href={plan}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-200"
                    >
                      {fileLabel(plan)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section id="detalle-unidades" className="px-5 pb-10 md:px-8 md:pb-24">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Departamentos"
              title="Disponibilidad por unidad dentro del edificio."
              description={
                <ResponsiveCopy
                  mobile="Revisa disponibilidad, precio y datos clave."
                  desktop="Revisa tipologia, piso, area, precio y estado de cada unidad disponible dentro del proyecto."
                />
              }
            />

            <div className="mt-5 flex flex-wrap gap-2.5 sm:mt-6">
              <FilterPill active={unitFilter === "all"} onClick={() => setUnitFilter("all")}>
                Todas
              </FilterPill>
              <FilterPill
                active={unitFilter === "available"}
                onClick={() => setUnitFilter("available")}
              >
                Disponibles
              </FilterPill>
              <FilterPill active={unitFilter === "2h"} onClick={() => setUnitFilter("2h")}>
                Hasta 2H
              </FilterPill>
              <FilterPill active={unitFilter === "3h"} onClick={() => setUnitFilter("3h")}>
                3H o mas
              </FilterPill>
            </div>

            <div className="mt-6 grid gap-4 md:mt-10 md:grid-cols-2 xl:grid-cols-3">
              {visibleUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#FFDC63]">
                        {unit.floorLabel}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold sm:mt-3 sm:text-2xl">{unit.title}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        unit.isAvailable
                          ? "bg-[#FFDC63] text-black"
                          : "bg-white/10 text-stone-300"
                      }`}
                    >
                      {unit.isAvailable ? "Disponible" : "Reservado"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-stone-300 sm:mt-5">
                    <span>{unit.bedrooms} habitaciones</span>
                    <span>{unit.bathrooms} banos</span>
                    <span>{unit.area}</span>
                    <span>{unit.price ?? "Consultar"}</span>
                  </div>

                  <Button
                    className="mt-6 w-full"
                    onClick={() =>
                      onLeadIntent("departamento", detail.item.slug, unit.title)
                    }
                  >
                    Solicitar esta unidad
                  </Button>
                </div>
              ))}
            </div>

            {visibleUnits.length === 0 ? (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-sm text-stone-400 backdrop-blur-xl">
                No hay unidades para este filtro en este momento.
              </div>
            ) : null}

            {detail.item.planFiles.length > 0 && (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:mt-8 sm:rounded-[1.8rem] sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[#FFDC63]">
                    Planos disponibles
                  </p>
                  {detail.item.brochureFile && (
                    <a
                      href={detail.item.brochureFile}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#FFDC63]/30 bg-[#FFDC63]/12 px-4 py-2 text-sm font-medium text-[#FFDC63]"
                    >
                      Abrir ficha
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {detail.item.planFiles.map((plan) => (
                    <a
                      key={plan}
                      href={plan}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-200"
                    >
                      {fileLabel(plan)}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {detail.item.planFiles.length === 0 && detail.item.brochureFile && (
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:mt-8 sm:rounded-[1.8rem] sm:p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#FFDC63]">
                  Ficha del edificio
                </p>
                <a
                  href={detail.item.brochureFile}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-full border border-[#FFDC63]/30 bg-[#FFDC63]/12 px-4 py-2 text-sm font-medium text-[#FFDC63]"
                >
                  Abrir ficha
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {item.mapEmbedUrl && (
        <section id="detalle-mapa" className="px-5 pb-10 md:px-8 md:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 backdrop-blur-xl">
            <iframe
              title={`Mapa de ${item.title}`}
              src={item.mapEmbedUrl}
              loading="lazy"
              className="h-[420px] w-full border-0"
            />
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default function App() {
  const isAppleMobileSafari = useRef(detectAppleMobileSafari()).current;
  const [content, setContent] = useState<SiteContent>(fallbackContent);
  const [detail, setDetail] = useState<DetailState>(null);
  const [activeDetailImage, setActiveDetailImage] = useState<string>(
    fallbackContent.works[0]?.heroImage ?? fallbackContent.buildings[0]?.heroImage ?? ""
  );
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingContent, setLoadingContent] = useState(true);
  const [workSearch, setWorkSearch] = useState("");
  const [workStatusFilter, setWorkStatusFilter] = useState<"all" | "planificacion" | "en_progreso" | "finalizado">("all");
  const [buildingSearch, setBuildingSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState<"all" | "available" | "planificacion" | "en_progreso" | "finalizado">("all");
  const [openFaqId, setOpenFaqId] = useState<string | null>(fallbackContent.faqs[0]?.id ?? null);
  const [leadContext, setLeadContext] = useState<{
    interestType: LeadPayload["interestType"];
    referenceSlug?: string;
    unitLabel?: string;
  }>({ interestType: "general" });
  const [leadForm, setLeadForm] = useState<LeadFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [leadState, setLeadState] = useState<{
    loading: boolean;
    message: string;
    error: boolean;
  }>({ loading: false, message: "", error: false });
  const routeReadyRef = useRef(false);

  const findWorkBySlug = (slug: string) =>
    content.works.find((item) => item.slug === slug) ?? null;

  const findBuildingBySlug = (slug: string) =>
    content.buildings.find((item) => item.slug === slug) ?? null;

  useEffect(() => {
    let mounted = true;

    loadSiteContent()
      .then((nextContent) => {
        if (mounted) {
          setContent(nextContent);
          setActiveDetailImage(
            nextContent.works[0]?.heroImage ??
              nextContent.buildings[0]?.heroImage ??
              ""
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingContent(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!content.faqs.length) {
      setOpenFaqId(null);
      return;
    }

    setOpenFaqId((current) =>
      current && content.faqs.some((item) => item.id === current)
        ? current
        : content.faqs[0].id
    );
  }, [content.faqs]);

  useEffect(() => {
    let lenisInstance: LenisInstance | null = null;
    let animationFrameId: number | null = null;

    document.documentElement.style.scrollBehavior = "auto";

    async function initEffects() {
      if (isAppleMobileSafari) {
        return;
      }

      try {
        const LenisModule = (await import("lenis")) as {
          default: new (options: {
            duration: number;
            smoothWheel: boolean;
            wheelMultiplier: number;
            touchMultiplier: number;
          }) => LenisInstance;
        };
        const Lenis = LenisModule.default;

        lenisInstance = new Lenis({
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 0.86,
          touchMultiplier: 1.15,
        });

        const raf = (time: number) => {
          lenisInstance?.raf(time);
          animationFrameId = requestAnimationFrame(raf);
        };

        animationFrameId = requestAnimationFrame(raf);
      } catch (error: unknown) {
        console.warn("Lenis no esta instalado.", error);
      }

      try {
        const gsapModule = (await import("gsap")) as GsapModule;
        const scrollTriggerModule = (await import(
          "gsap/ScrollTrigger"
        )) as ScrollTriggerModule;

        const gsap = gsapModule.gsap || gsapModule.default;
        const ScrollTrigger =
          scrollTriggerModule.ScrollTrigger || scrollTriggerModule.default;

        if (!gsap || !ScrollTrigger) {
          throw new Error("GSAP o ScrollTrigger no disponibles");
        }

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll(".gsap-reveal").forEach((element) => {
          gsap.fromTo(
            element,
            {
              opacity: 0,
              y: 42,
              filter: "blur(14px)",
            },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: {
                trigger: element,
                start: "top 84%",
              },
            }
          );
        });
      } catch (error: unknown) {
        console.warn("GSAP no esta instalado.", error);
      }
    }

    void initEffects();

    return () => {
      document.documentElement.style.scrollBehavior = "auto";
      lenisInstance?.destroy?.();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAppleMobileSafari]);

  useEffect(() => {
    const onScroll = () => {
      setIsHeaderCompact(window.scrollY > 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!quoteModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [quoteModalOpen]);

  useEffect(() => {
    if (!quoteModalOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQuoteModalOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [quoteModalOpen]);

  useEffect(() => {
    if (loadingContent || routeReadyRef.current) {
      return;
    }

    const currentRoute = parseRoute();

    if (currentRoute.kind === "home") {
      window.history.replaceState({ kind: "home", app: true }, "", "/");
      routeReadyRef.current = true;
      return;
    }

    const target =
      currentRoute.kind === "work"
        ? findWorkBySlug(currentRoute.slug)
        : findBuildingBySlug(currentRoute.slug);

    if (!target) {
      window.history.replaceState({ kind: "home", app: true }, "", "/");
      routeReadyRef.current = true;
      return;
    }

    const detailPath = buildRoute(currentRoute.kind, currentRoute.slug);
    window.history.replaceState({ kind: "home", app: true }, "", "/");
    window.history.pushState(
      { kind: currentRoute.kind, slug: currentRoute.slug, app: true },
      "",
      detailPath
    );

    setDetail(
      currentRoute.kind === "work"
        ? { kind: "work", item: target as WorkProject }
        : { kind: "building", item: target as BuildingProject }
    );
    setActiveDetailImage(target.gallery[0] ?? target.heroImage);
    routeReadyRef.current = true;
    window.scrollTo(0, 0);
  }, [content, loadingContent]);

  useEffect(() => {
    if (loadingContent) {
      return;
    }

    const onPopState = () => {
      const currentRoute = parseRoute();

      if (currentRoute.kind === "home") {
        setDetail(null);
        setMenuOpen(false);
        window.scrollTo(0, 0);
        return;
      }

      const target =
        currentRoute.kind === "work"
          ? findWorkBySlug(currentRoute.slug)
          : findBuildingBySlug(currentRoute.slug);

      if (!target) {
        setDetail(null);
        window.history.replaceState({ kind: "home", app: true }, "", "/");
        window.scrollTo(0, 0);
        return;
      }

      setMenuOpen(false);
      setDetail(
        currentRoute.kind === "work"
          ? { kind: "work", item: target as WorkProject }
          : { kind: "building", item: target as BuildingProject }
      );
      setActiveDetailImage(target.gallery[0] ?? target.heroImage);
      window.scrollTo(0, 0);
    };

    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [content, loadingContent]);

  const heroOpenCatalog = () => {
    document.getElementById("obras")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const openLeadContext = (
    interestType: LeadPayload["interestType"],
    referenceSlug?: string,
    unitLabel?: string
  ) => {
    setLeadContext({ interestType, referenceSlug, unitLabel });
    setLeadState({ loading: false, message: "", error: false });
    setQuoteModalOpen(true);
  };

  const openWork = (item: WorkProject) => {
    setDetail({ kind: "work", item });
    setActiveDetailImage(item.gallery[0] ?? item.heroImage);
    setMenuOpen(false);
    window.history.pushState(
      { kind: "work", slug: item.slug, app: true },
      "",
      buildRoute("work", item.slug)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openBuilding = (item: BuildingProject) => {
    setDetail({ kind: "building", item });
    setActiveDetailImage(item.gallery[0] ?? item.heroImage);
    setMenuOpen(false);
    window.history.pushState(
      { kind: "building", slug: item.slug, app: true },
      "",
      buildRoute("building", item.slug)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeDetail = () => {
    setMenuOpen(false);
    if (parseRoute().kind !== "home") {
      window.history.back();
      return;
    }

    setDetail(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDetailImageSelect = (image: string) => {
    setActiveDetailImage(image);
    requestAnimationFrame(() => {
      document.getElementById("detalle-media-top")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const navLinks = detail
    ? [
        { label: "Resumen", href: "#detalle-resumen" },
        { label: "Galeria", href: "#detalle-galeria" },
        {
          label: detail.kind === "building" ? "Unidades" : "Avances",
          href: detail.kind === "building" ? "#detalle-unidades" : "#detalle-avances",
        },
        ...(detail.item.mapEmbedUrl
          ? [{ label: "Mapa", href: "#detalle-mapa" }]
          : []),
      ]
    : [
        { label: "Servicios", href: "#servicios" },
        { label: "Obras", href: "#obras" },
        { label: "Edificios", href: "#edificios" },
        { label: "Nosotros", href: "#nosotros" },
        { label: "Contacto", href: "#contacto" },
      ];

  const visibleWorks = content.works.filter((item) => {
    const matchesSearch = `${item.title} ${item.location} ${item.category}`
      .toLowerCase()
      .includes(workSearch.toLowerCase());
    const matchesStatus =
      workStatusFilter === "all" || item.status === workStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const visibleBuildings = content.buildings.filter((item) => {
    const matchesSearch = `${item.title} ${item.location} ${item.category}`
      .toLowerCase()
      .includes(buildingSearch.toLowerCase());

    if (buildingFilter === "all") {
      return matchesSearch;
    }

    if (buildingFilter === "available") {
      return matchesSearch && item.units.some((unit) => unit.isAvailable);
    }

    return matchesSearch && item.status === buildingFilter;
  });

  const submitLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLeadState({ loading: true, message: "", error: false });

    try {
      await createLead({
        fullName: `${leadForm.firstName} ${leadForm.lastName}`.trim(),
        phone: leadForm.phone,
        email: leadForm.email,
        message: `Ciudad: ${leadForm.city}\n${leadForm.message}`,
        interestType: leadContext.interestType,
        referenceSlug: leadContext.referenceSlug,
        unitLabel: leadContext.unitLabel,
      });

      setLeadForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        city: "",
        message: "",
      });
      setLeadContext({ interestType: "general" });
      setLeadState({
        loading: false,
        message:
          "Nos pondremos en contacto lo mas antes posible con una propuesta adecuada para tu proyecto.",
        error: false,
      });
    } catch (error) {
      console.error(error);
      setLeadState({
        loading: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo enviar tu solicitud. Intenta nuevamente en unos minutos.",
        error: true,
      });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0d0c0a] text-stone-100 selection:bg-[#FFDC63] selection:text-black">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(255,220,99,0.18),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#0d0c0a_0%,#14110d_46%,#0d0c0a_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute left-1/2 top-[14%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#FFDC63]/10 blur-[140px]" />
      </div>

      <header className="pointer-events-none fixed left-0 right-0 top-0 z-50">
        <nav className="pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 pt-4 transition-all duration-500 sm:px-5 sm:pt-5 md:px-8">
          <a
            href={detail ? "#detalle-hero" : "#inicio"}
            onClick={(event) => {
              if (detail) {
                event.preventDefault();
                closeDetail();
              } else {
                event.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="relative z-10 min-w-0"
          >
            <BrandLockup className="justify-start" />
          </a>

          <div className="absolute left-1/2 top-0 hidden h-[76px] w-[600px] -translate-x-1/2 md:block">
            <svg
              viewBox="0 0 600 76"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition-all duration-500"
            >
              <path
                d="M0 0H600C568 0 553 44 506 48H94C47 44 32 0 0 0Z"
                className={`transition-all duration-500 ${
                  isHeaderCompact ? "fill-white/14" : "fill-[#f3eee7]"
                }`}
              />
            </svg>
            <svg
              viewBox="0 0 600 76"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              <path
                d="M0 0H600C568 0 553 44 506 48H94C47 44 32 0 0 0Z"
                fill="none"
                className={`transition-all duration-500 ${
                  isHeaderCompact ? "stroke-white/18" : "stroke-[#ebe0d3]"
                }`}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <div
              className={`relative z-10 flex h-[54px] items-center justify-center gap-8 text-sm font-medium transition-all duration-500 ${
                isHeaderCompact ? "text-white" : "text-stone-900"
              }`}
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-[#9a6a42]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {detail ? (
            <button
              type="button"
              onClick={closeDetail}
              className={`relative z-10 hidden h-[52px] items-center justify-center rounded-full px-6 text-base font-medium transition md:inline-flex ${
                isHeaderCompact
                  ? "border border-white/18 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[24px] hover:bg-white/[0.14]"
                  : "bg-white/10 text-white backdrop-blur-2xl hover:bg-white/[0.16]"
              }`}
            >
              Volver
            </button>
          ) : (
            <div className="relative z-10 hidden items-center gap-3 md:flex">
              <a
                href="/cms"
                className={`inline-flex h-[52px] items-center justify-center rounded-full px-5 text-sm font-medium transition ${
                  isHeaderCompact
                    ? "border border-white/18 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[24px] hover:bg-white/[0.14]"
                    : "border border-white/35 bg-white/10 text-white backdrop-blur-2xl hover:bg-white/[0.16]"
                }`}
              >
                Login
              </a>
              <button
                type="button"
                onClick={() => openLeadContext("general")}
                className={`inline-flex h-[52px] items-center justify-center rounded-full px-6 text-base font-medium transition ${
                  isHeaderCompact
                    ? "border border-white/18 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[24px] hover:bg-white/[0.14]"
                    : "border border-white/35 bg-white/10 text-white backdrop-blur-2xl hover:bg-white/[0.16]"
                }`}
              >
                Cotizar obra
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className={`relative z-10 grid h-11 w-11 place-items-center rounded-full border transition md:hidden ${
              isHeaderCompact
                ? isAppleMobileSafari
                  ? "border-white/15 bg-white/[0.12]"
                  : "border-white/15 bg-white/[0.08] backdrop-blur-xl"
                : isAppleMobileSafari
                  ? "border-white/20 bg-black/45"
                  : "border-white/20 bg-black/20 backdrop-blur-xl"
            }`}
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        links={navLinks.map((link) => ({
          label: link.label,
          href: link.href,
          onClick: link.href === "#detalle-hero" ? closeDetail : undefined,
        }))}
        actionLabel={detail ? "Volver" : "Login"}
        actionHref={detail ? "#detalle-hero" : "/cms"}
        actionOnClick={detail ? closeDetail : undefined}
        isAppleMobileSafari={isAppleMobileSafari}
      />

      <QuoteModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        form={leadForm}
        onChange={(field, value) =>
          setLeadForm((current) => ({ ...current, [field]: value }))
        }
        onSubmit={submitLead}
        loading={leadState.loading}
        success={Boolean(leadState.message) && !leadState.error}
        error={leadState.error}
        successMessage={leadState.message}
        contextLabel={interestTypeLabel(leadContext.interestType, leadContext.unitLabel)}
        isAppleMobileSafari={isAppleMobileSafari}
      />

      <QuoteFloatingButton
        onClick={() => openLeadContext("general")}
        hidden={menuOpen || quoteModalOpen}
      />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {detail ? (
            <DetailViewScreen
              detail={detail}
              activeImage={activeDetailImage}
              onImageSelect={handleDetailImageSelect}
              onBack={closeDetail}
              onLeadIntent={openLeadContext}
            />
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <section id="inicio" className="relative min-h-screen">
                <HeroSection
                  companyName={content.settings.companyName}
                  heroEyebrow={content.settings.heroEyebrow}
                  heroTitle={content.settings.heroTitle}
                  heroAccent={content.settings.heroAccent}
                  heroDescription={content.settings.heroDescription}
                  heroImage={content.settings.heroImage}
                  tagline={content.settings.tagline}
                  location={content.settings.location}
                  onOpenCatalog={heroOpenCatalog}
                  onOpenContact={() => openLeadContext("general")}
                />
              </section>

              <section id="obras" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
                    <SectionHeading
                      eyebrow="Obras"
                      title="Obras con criterio tecnico y ejecucion cuidada."
                      description={
                        <ResponsiveCopy
                          mobile="Proyectos residenciales y comerciales con orden y seguimiento."
                          desktop="Desarrollamos proyectos residenciales, comerciales e institucionales con orden, seguimiento y atencion al detalle."
                        />
                      }
                    />
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => openLeadContext("obra")}
                    >
                      Cotizar una obra
                    </Button>
                  </div>

                  <div className="mb-6 flex flex-col gap-3 sm:mb-8">
                    <ProjectSearchField
                      value={workSearch}
                      onChange={setWorkSearch}
                      placeholder="Buscar obra por nombre, ubicacion o categoria"
                    />
                    <div className="flex flex-wrap gap-2.5">
                      <FilterPill
                        active={workStatusFilter === "all"}
                        onClick={() => setWorkStatusFilter("all")}
                      >
                        Todas
                      </FilterPill>
                      <FilterPill
                        active={workStatusFilter === "en_progreso"}
                        onClick={() => setWorkStatusFilter("en_progreso")}
                      >
                        En progreso
                      </FilterPill>
                      <FilterPill
                        active={workStatusFilter === "finalizado"}
                        onClick={() => setWorkStatusFilter("finalizado")}
                      >
                        Finalizadas
                      </FilterPill>
                      <FilterPill
                        active={workStatusFilter === "planificacion"}
                        onClick={() => setWorkStatusFilter("planificacion")}
                      >
                        Planificacion
                      </FilterPill>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {visibleWorks.map((item) => (
                      <CatalogCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.category}
                        image={item.heroImage}
                        detail={`${item.location} / ${statusLabel(item.status)}`}
                        badge="Obra"
                        onClick={() => openWork(item)}
                      />
                    ))}
                  </div>

                  {visibleWorks.length === 0 ? (
                    <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-sm text-stone-400 backdrop-blur-xl">
                      No encontramos obras con ese filtro.
                    </div>
                  ) : null}
                </div>
              </section>

              <section id="servicios" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
                    <SectionHeading
                      eyebrow="Servicios"
                      title="Servicios pensados para construir bien y acompanar mejor."
                      description={
                        <ResponsiveCopy
                          mobile="Planificacion, ejecucion y supervision con enfoque practico."
                          desktop="Planificamos, ejecutamos y supervisamos proyectos con una mirada practica, tecnica y cercana al cliente."
                        />
                      }
                    />
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-300 backdrop-blur-xl">
                      {content.settings.location}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {content.services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                </div>
              </section>

              <section id="edificios" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto max-w-7xl">
                  <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6">
                    <SectionHeading
                      eyebrow="Edificios"
                      title="Edificios y desarrollos con lectura clara de cada unidad."
                      description={
                        <ResponsiveCopy
                          mobile="Tipologias, disponibilidad y datos clave por unidad."
                          desktop="Mostramos tipologias, disponibilidad y caracteristicas esenciales para que cada proyecto se entienda con claridad."
                        />
                      }
                    />
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => openLeadContext("edificio")}
                    >
                      Consultar un edificio
                    </Button>
                  </div>

                  <div className="mb-6 flex flex-col gap-3 sm:mb-8">
                    <ProjectSearchField
                      value={buildingSearch}
                      onChange={setBuildingSearch}
                      placeholder="Buscar edificio por nombre, ubicacion o categoria"
                    />
                    <div className="flex flex-wrap gap-2.5">
                      <FilterPill
                        active={buildingFilter === "all"}
                        onClick={() => setBuildingFilter("all")}
                      >
                        Todos
                      </FilterPill>
                      <FilterPill
                        active={buildingFilter === "available"}
                        onClick={() => setBuildingFilter("available")}
                      >
                        Con unidades
                      </FilterPill>
                      <FilterPill
                        active={buildingFilter === "en_progreso"}
                        onClick={() => setBuildingFilter("en_progreso")}
                      >
                        En progreso
                      </FilterPill>
                      <FilterPill
                        active={buildingFilter === "finalizado"}
                        onClick={() => setBuildingFilter("finalizado")}
                      >
                        Finalizados
                      </FilterPill>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {visibleBuildings.map((item) => (
                      <CatalogCard
                        key={item.id}
                        title={item.title}
                        subtitle={item.category}
                        image={item.heroImage}
                        detail={`${item.units.filter((unit) => unit.isAvailable).length} unidades disponibles`}
                        badge="Edificio"
                        onClick={() => openBuilding(item)}
                      />
                    ))}
                  </div>

                  {visibleBuildings.length === 0 ? (
                    <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white/[0.04] px-4 py-8 text-center text-sm text-stone-400 backdrop-blur-xl">
                      No encontramos edificios con ese filtro.
                    </div>
                  ) : null}
                </div>
              </section>

              <section id="nosotros" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto max-w-7xl">
                  <SectionHeading
                    eyebrow="Nosotros"
                    title="Un equipo que combina direccion, obra y seguimiento tecnico."
                    description={
                      <ResponsiveCopy
                        mobile="Responsables claros, presencia en obra y trato directo."
                        desktop="Acompanamos cada proyecto con responsables claros, presencia en campo y una comunicacion directa con el cliente."
                      />
                    }
                  />

                  <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-5 lg:grid-cols-3">
                    {content.team.map((member) => (
                      <TeamCard key={member.id} member={member} />
                    ))}
                  </div>
                </div>
              </section>

              <section id="testimonios" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto max-w-7xl">
                  <SectionHeading
                    eyebrow="Testimonios"
                    title="Confianza construida en cada proyecto."
                    description={
                      <ResponsiveCopy
                        mobile="Clientes y desarrolladores que valoraron orden, seguimiento y ejecucion."
                        desktop="Clientes y desarrolladores que valoraron el orden del proceso, la comunicacion y la ejecucion de cada etapa."
                      />
                    }
                  />

                  <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    {content.testimonials.map((item) => (
                      <TestimonialCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </section>

              <section id="proceso" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10">
                  <div>
                    <SectionHeading
                      eyebrow="Proceso"
                      title="Una forma de trabajo clara desde el inicio hasta la entrega."
                      description={
                        <ResponsiveCopy
                          mobile="Planificacion, ejecucion, supervision y entrega."
                          desktop="Cada proyecto se organiza con planificacion, ejecucion, supervision y cierre para sostener calidad y cumplimiento."
                        />
                      }
                    />
                  </div>

                  <div className="relative rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[3rem] sm:p-5 md:p-8">
                    <div className="absolute -inset-1 -z-10 rounded-[3.2rem] bg-gradient-to-br from-[#FFDC63]/20 via-transparent to-white/5 blur-xl" />
                    {processSteps.map((step) => (
                      <div
                        key={step[0]}
                        className="gsap-reveal flex gap-3 border-b border-white/10 py-4 last:border-b-0 sm:gap-5 sm:py-6"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-[#FFDC63]/25 bg-[#FFDC63]/10 text-sm font-semibold text-[#FFDC63] sm:h-12 sm:w-12">
                          {step[0]}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold sm:text-2xl">{step[1]}</h3>
                          <p className="mt-1.5 text-sm leading-6 text-stone-400 sm:mt-2 sm:text-base sm:leading-7">{step[2]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section id="faq" className="gsap-zone px-5 py-14 sm:py-24 md:px-8 md:py-28">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:gap-10">
                  <div>
                    <SectionHeading
                      eyebrow="Preguntas frecuentes"
                      title="Respuestas claras antes de iniciar."
                      description={
                        <ResponsiveCopy
                          mobile="Resolvemos dudas comunes sobre cotizacion, seguimiento y desarrollo."
                          desktop="Resolvemos dudas comunes sobre cotizacion, seguimiento de obra, edificios y coordinacion general del proyecto."
                        />
                      }
                    />
                  </div>

                  <div className="grid gap-3">
                    {content.faqs.map((item) => (
                      <FaqCard
                        key={item.id}
                        item={item}
                        open={openFaqId === item.id}
                        onToggle={() =>
                          setOpenFaqId((current) => (current === item.id ? null : item.id))
                        }
                      />
                    ))}
                  </div>
                </div>
              </section>

              <section id="contacto" className="px-5 pb-8 pt-12 sm:pt-20 md:px-8">
                <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#FFDC63] text-black shadow-2xl shadow-black/40 sm:rounded-[3rem]">
                  <div className="grid gap-6 p-4 sm:p-8 md:p-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-8 lg:p-16">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.28em] text-black/55 sm:text-sm sm:tracking-[0.32em]">
                        Contacto
                      </p>
                      <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.06em] sm:text-4xl md:text-6xl">
                        Conversemos sobre tu proyecto.
                      </h2>
                      <p className="mt-4 max-w-2xl text-sm leading-6 text-black/70 sm:mt-6 sm:text-lg sm:leading-8">
                        <ResponsiveCopy
                          mobile="Cuéntanos tu proyecto y te ayudamos a revisar alcance y cotizacion."
                          desktop="Si estas planificando una obra, un edificio o una ampliacion, podemos ayudarte a revisar el alcance y preparar una cotizacion."
                        />
                      </p>

                      <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                        <div className="rounded-[1.5rem] bg-black/10 p-4">
                          <Phone className="h-5 w-5 text-black/70" />
                          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-black/45">
                            Telefono principal
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {content.settings.contact.phone}
                          </p>
                        </div>
                        <div className="rounded-[1.5rem] bg-black/10 p-4">
                          <MessageSquare className="h-5 w-5 text-black/70" />
                          <p className="mt-3 text-sm uppercase tracking-[0.22em] text-black/45">
                            Email
                          </p>
                          <p className="mt-2 text-lg font-semibold">
                            {content.settings.contact.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.6rem] bg-black/10 p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-6">
                      <p className="text-sm uppercase tracking-[0.22em] text-black/45">
                        Sucursales
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] sm:mt-4 sm:text-3xl">
                        Estamos presentes donde se mueve la obra
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-black/70 sm:mt-4 sm:text-base sm:leading-7">
                        <ResponsiveCopy
                          mobile="Escribe o visita la sucursal mas cercana."
                          desktop="Puedes escribirnos o visitar la sucursal mas cercana para revisar tu proyecto con mayor detalle."
                        />
                      </p>

                      <div className="mt-5 grid gap-3 sm:mt-6 sm:gap-4">
                        {content.settings.contact.branches.map((branch) => (
                          <div key={branch.id} className="rounded-[1.2rem] bg-black/10 p-3.5 sm:rounded-[1.4rem] sm:p-4">
                            <p className="text-sm uppercase tracking-[0.22em] text-black/45">
                              {branch.name}
                            </p>
                            <p className="mt-2 text-base font-semibold sm:text-lg">{branch.address}</p>
                            <p className="mt-2 text-sm text-black/70">{branch.phone}</p>
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => openLeadContext("general")}
                        className="mt-8 inline-flex h-[52px] items-center justify-center rounded-full bg-black px-6 text-base font-medium text-white"
                      >
                        Solicitar cotizacion
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <footer className="px-5 pb-8 pt-8 md:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:rounded-[2rem] md:p-8">
                  <div>
                    <BrandLockup className="justify-start" />
                    <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300 sm:text-lg sm:leading-8">
                      <ResponsiveCopy
                        mobile={content.settings.tagline || content.settings.location}
                        desktop={content.settings.tagline || content.settings.heroDescription}
                      />
                    </p>
                    <p className="mt-3 text-sm uppercase tracking-[0.24em] text-stone-500">
                      {content.settings.location}
                    </p>
                    <a
                      href="/cms"
                      className="mt-6 inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 text-sm font-medium text-white"
                    >
                      Login
                    </a>
                  </div>
                  <div className="text-sm text-stone-400">
                    <div className="grid gap-3 md:hidden">
                      <p className="font-medium text-white">
                        {content.settings.contact.branches.length} sucursales activas
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#FFDC63]" />
                        {content.settings.contact.phone}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-[#FFDC63]" />
                        {content.settings.contact.email}
                      </p>
                    </div>
                    <div className="hidden gap-4 md:grid">
                    {content.settings.contact.branches.map((branch) => (
                      <div key={branch.id} className="grid gap-2">
                        <p className="font-medium text-white">{branch.name}</p>
                        <p className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#FFDC63]" />
                          {branch.address}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#FFDC63]" />
                          {branch.phone}
                        </p>
                      </div>
                    ))}
                    <p className="inline-flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[#FFDC63]" />
                      {content.settings.contact.email}
                    </p>
                    </div>
                  </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
