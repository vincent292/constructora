import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Spline from "@splinetool/react-spline";
import {
  ArrowUpRight,
  Building2,
  Hammer,
  Layers3,
  MapPin,
  Menu,
  Ruler,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type Service = {
  icon: React.ElementType;
  title: string;
  text: string;
};

type ProjectMetric = {
  label: string;
  value: string;
};

type Project = {
  title: string;
  category: string;
  location: string;
  year: string;
  area: string;
  summary: string;
  description: string;
  heroImage: string;
  gallery: string[];
  metrics: ProjectMetric[];
};

type LenisInstance = {
  raf: (time: number) => void;
  destroy?: () => void;
};

type GsapModule = {
  gsap?: {
    registerPlugin: (plugin: unknown) => void;
    fromTo: (
      target: string,
      fromVars: Record<string, unknown>,
      toVars: Record<string, unknown>
    ) => void;
    to: (
      target: string | HTMLDivElement | null,
      vars: Record<string, unknown>
    ) => void;
  };
  default?: {
    registerPlugin: (plugin: unknown) => void;
    fromTo: (
      target: string,
      fromVars: Record<string, unknown>,
      toVars: Record<string, unknown>
    ) => void;
    to: (
      target: string | HTMLDivElement | null,
      vars: Record<string, unknown>
    ) => void;
  };
};

type ScrollTriggerModule = {
  ScrollTrigger?: unknown;
  default?: unknown;
};

const projects: Project[] = [
  {
    title: "Torre Mirador",
    category: "Residencial premium",
    location: "Cochabamba, Bolivia",
    year: "2026",
    area: "4.200 m2",
    summary:
      "Una torre pensada para transmitir presencia y orden desde su primera vista.",
    description:
      "El proyecto combina una fachada limpia, un lobby de acceso sobrio y circulaciones muy claras. La idea fue construir una experiencia visual que comunique valor desde la calle y confianza durante todo el recorrido.",
    heroImage:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
    ],
    metrics: [
      { label: "Ubicacion", value: "Zona Norte" },
      { label: "Programa", value: "28 departamentos" },
      { label: "Entrega", value: "Llave en mano" },
      { label: "Visual", value: "Lobby + fachada + terrazas" },
    ],
  },
  {
    title: "Casa Piedra Norte",
    category: "Arquitectura privada",
    location: "Tiquipaya, Bolivia",
    year: "2025",
    area: "620 m2",
    summary:
      "Una residencia contemporanea con materiales calidos y una lectura espacial muy serena.",
    description:
      "Se planteo una casa de caracter sobrio, con grandes visuales, patios contenidos y una secuencia de espacios que acompana la vida diaria. La seleccion de materiales prioriza durabilidad, textura y una presencia atemporal.",
    heroImage:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
    ],
    metrics: [
      { label: "Ubicacion", value: "Cond. Los Alamos" },
      { label: "Programa", value: "Vivienda unifamiliar" },
      { label: "Entrega", value: "Diseno + obra" },
      { label: "Visual", value: "Patios + volumenes + piedra" },
    ],
  },
  {
    title: "Centro Empresarial Nova",
    category: "Obra comercial",
    location: "Santa Cruz, Bolivia",
    year: "2024",
    area: "6.850 m2",
    summary:
      "Un volumen corporativo de lectura nitida, pensado para marcas que buscan solidez.",
    description:
      "La propuesta prioriza una imagen empresarial sobria, circulaciones eficientes y una fachada que cambia con la luz del dia. La experiencia del visitante fue tratada como parte central del proyecto, desde el acceso hasta las plantas de trabajo.",
    heroImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1600&q=80",
    ],
    metrics: [
      { label: "Ubicacion", value: "Equipetrol" },
      { label: "Programa", value: "Oficinas y retail" },
      { label: "Entrega", value: "Ejecucion integral" },
      { label: "Visual", value: "Acceso + recepcion + altura" },
    ],
  },
];

const services: Service[] = [
  {
    icon: Building2,
    title: "Diseno y ejecucion",
    text: "Planificacion, arquitectura y construccion integral de proyectos residenciales y comerciales.",
  },
  {
    icon: Ruler,
    title: "Supervision de obra",
    text: "Control de avance, calidad, presupuesto, cronograma y cumplimiento tecnico.",
  },
  {
    icon: Layers3,
    title: "Gestion de materiales",
    text: "Optimizacion de compras, inventario, proveedores y costos por proyecto.",
  },
  {
    icon: ShieldCheck,
    title: "Seguridad y garantia",
    text: "Procesos formales, documentacion clara y seguimiento transparente para cada cliente.",
  },
];

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
      "bg-[#d8bd82] text-black hover:bg-[#f1d799] shadow-lg shadow-[#d8bd82]/10",
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

function ArchitecturalHero() {
  const beams = [
    "left-[14%] h-[360px] rotate-[-18deg]",
    "left-[30%] h-[430px] rotate-[-8deg]",
    "left-[50%] h-[500px] rotate-[0deg]",
    "left-[68%] h-[420px] rotate-[8deg]",
    "left-[84%] h-[350px] rotate-[18deg]",
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[2.25rem] sm:rounded-[3rem] [perspective:1200px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(216,189,130,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(0,0,0,0.2))]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:42px_42px]" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute left-1/2 top-[48%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d8bd82]/15 sm:top-[46%] sm:h-[560px] sm:w-[560px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 80, rotateX: 64, rotateZ: -2 }}
        animate={{ opacity: 1, y: 0, rotateX: 64, rotateZ: -2 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute bottom-[-30px] left-1/2 h-[220px] w-[360px] -translate-x-1/2 rounded-[1.5rem] border border-[#d8bd82]/20 bg-[#d8bd82]/8 shadow-2xl shadow-black/50 sm:bottom-[-58px] sm:h-[360px] sm:w-[640px] sm:rounded-[2rem] [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 rounded-[1.5rem] bg-[linear-gradient(90deg,rgba(216,189,130,.14)_1px,transparent_1px),linear-gradient(rgba(216,189,130,.14)_1px,transparent_1px)] [background-size:36px_36px] sm:rounded-[2rem] sm:[background-size:54px_54px]" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60, rotateY: -18 }}
        animate={{ opacity: 1, y: 0, rotateY: [-18, -10, -18] }}
        transition={{
          opacity: { duration: 0.9 },
          y: { duration: 0.9 },
          rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-[42px] left-1/2 h-[250px] w-[165px] -translate-x-1/2 overflow-hidden rounded-t-[1.5rem] border border-[#d8bd82]/30 bg-gradient-to-b from-white/18 via-[#d8bd82]/10 to-black/40 shadow-2xl shadow-black/60 backdrop-blur-xl sm:bottom-[92px] sm:h-[390px] sm:w-[245px] sm:rounded-t-[2.2rem] [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/14 via-transparent to-black/20" />

        <div className="grid h-full grid-cols-5 gap-2 p-3 sm:gap-3 sm:p-5">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.12 }}
              animate={{ opacity: [0.15, 0.65, 0.22] }}
              transition={{
                duration: 2.8,
                delay: i * 0.035,
                repeat: Infinity,
              }}
              className="rounded-[3px] bg-[#d8bd82]/35 shadow-sm shadow-[#d8bd82]/20"
            />
          ))}
        </div>
      </motion.div>

      {beams.map((beam, index) => (
        <motion.div
          key={beam}
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15 + index * 0.08 }}
          className={`absolute bottom-[44px] hidden w-[22px] rounded-t-xl border border-white/8 bg-black/30 shadow-xl backdrop-blur-md sm:bottom-[86px] sm:block sm:w-[34px] ${beam}`}
        >
          <div className="absolute inset-x-2 bottom-4 top-4 bg-[linear-gradient(rgba(216,189,130,.28)_1px,transparent_1px)] [background-size:100%_26px]" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, x: 110 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.1, delay: 0.35 }}
        className="absolute right-[3%] top-[14%] hidden h-[170px] w-[260px] sm:right-[6%] sm:top-[18%] sm:block"
      >
        <div className="absolute left-8 top-0 h-full w-3 rounded-full bg-[#d8bd82]/35" />
        <div className="absolute left-8 top-3 h-3 w-[210px] rounded-full bg-[#d8bd82]/35" />
        <div className="absolute right-5 top-3 h-20 w-1 bg-[#d8bd82]/25" />
        <div className="absolute right-2 top-[82px] h-8 w-8 rounded-md border border-[#d8bd82]/25 bg-black/20" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0], opacity: [0.55, 0.9, 0.55] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-4 top-4 rounded-full border border-[#d8bd82]/20 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d8bd82] backdrop-blur-xl sm:left-[12%] sm:top-[18%] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.25em]"
      >
        BIM / 3D Vision
      </motion.div>

      <div className="absolute bottom-12 left-1/2 h-8 w-[78%] -translate-x-1/2 rounded-full bg-black/50 blur-xl sm:bottom-20 sm:h-10" />
      <div className="absolute inset-x-6 bottom-10 h-px bg-gradient-to-r from-transparent via-[#d8bd82]/50 to-transparent sm:inset-x-10 sm:bottom-16" />
    </div>
  );
}

function ProjectDetailView({
  project,
  activeImage,
  onImageSelect,
  onBack,
}: {
  project: Project;
  activeImage: string;
  onImageSelect: (image: string) => void;
  onBack: () => void;
}) {
  return (
    <motion.div
      key={project.title}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <section
        id="detalle-proyecto"
        className="relative min-h-[88svh] overflow-hidden sm:min-h-screen"
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={project.title}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.38),rgba(0,0,0,0.45)_32%,rgba(0,0,0,0.84)_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-7xl flex-col justify-end px-5 pb-10 pt-24 sm:min-h-screen sm:pb-12 sm:pt-32 md:px-8 md:pb-16 md:pt-40">
          <button
            type="button"
            onClick={onBack}
            className="mb-6 inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-white/15 bg-black/25 px-4 py-2 text-sm text-stone-200 backdrop-blur-xl transition hover:border-[#d8bd82]/35 hover:text-[#d8bd82] sm:mb-8"
          >
            <X className="h-4 w-4" />
            Volver a proyectos
          </button>

          <div className="max-w-4xl">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
              {project.category}
            </p>

            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl md:text-7xl lg:text-8xl">
              {project.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg sm:leading-8 md:text-xl">
              {project.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-stone-300 sm:gap-5 md:text-base">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#d8bd82]" />
                {project.location}
              </span>
              <span>{project.year}</span>
              <span>{project.area}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="detalle-datos" className="px-5 py-16 sm:py-20 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.95fr_1.05fr]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
              Informacion del proyecto
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-6xl">
              Una vista completa, no solo una imagen ampliada.
            </h2>
          </div>

          <div>
            <p className="text-base leading-7 text-stone-300 sm:text-lg sm:leading-8">
              {project.description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {project.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl sm:rounded-[1.8rem] sm:p-5"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-xl font-semibold text-stone-100">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="detalle-galeria" className="px-5 pb-16 sm:pb-20 md:px-8 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                Galeria del proyecto
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-6xl">
                Fotos, vistas y recorrido visual.
              </h2>
            </div>

            <p className="max-w-xl leading-7 text-stone-400">
              Esta vista puede crecer despues con renders, planos, avance de
              obra, video, ubicacion en mapa y documentacion del proyecto.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
            <div className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.035] sm:rounded-[2.5rem]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${project.title}-${activeImage}`}
                  src={activeImage}
                  alt={project.title}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="h-[260px] w-full object-cover sm:h-[420px] md:h-[620px]"
                />
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {project.gallery.map((image, index) => {
                const isActive = image === activeImage;

                return (
                  <button
                    key={`${project.title}-gallery-${index}`}
                    type="button"
                    onClick={() => onImageSelect(image)}
                    className={`group relative overflow-hidden rounded-[2rem] border text-left transition ${
                      isActive
                        ? "border-[#d8bd82]/45"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${project.title} vista ${index + 1}`}
                      className="h-36 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-44 md:h-[198px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between sm:bottom-4 sm:left-4 sm:right-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-stone-200 sm:text-sm sm:tracking-[0.24em]">
                        Vista {index + 1}
                      </span>
                      {isActive && (
                        <span className="rounded-full bg-[#d8bd82] px-3 py-1 text-xs font-medium text-black">
                          Activa
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="px-5 pb-10 sm:pb-14 md:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[3rem]">
          <div className="grid gap-8 p-5 sm:p-8 md:p-12 lg:grid-cols-[1.05fr_.95fr] lg:p-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                Ubicacion y cierre
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-5xl">
                {project.location}
              </h2>
              <p className="mt-6 max-w-2xl leading-8 text-stone-400">
                La idea es que esta pantalla ya se sienta como la pagina propia
                de la obra: identidad visual, contexto, recorrido y llamados a
                la accion sin volver a la landing principal.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5 sm:rounded-[2rem] sm:p-6">
              <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
                Proyecto seleccionado
              </p>
              <p className="mt-4 text-2xl font-semibold sm:text-3xl">{project.title}</p>
              <p className="mt-4 leading-7 text-stone-400">
                Si quieres, el siguiente paso puede ser separar esto en rutas
                reales para que cada obra tenga su URL propia.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button className="w-full sm:w-auto">
                  Solicitar propuesta
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full sm:min-w-[180px] sm:w-auto"
                  onClick={onBack}
                >
                  Ver otras obras
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project>(projects[0]);
  const [isProjectViewOpen, setIsProjectViewOpen] = useState<boolean>(false);
  const [activeProjectImage, setActiveProjectImage] = useState<string>(
    projects[0].heroImage
  );

  const { scrollYProgress } = useScroll({
    target: containerRef,
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  useEffect(() => {
    let lenisInstance: LenisInstance | null = null;
    let animationFrameId: number | null = null;

    document.documentElement.style.scrollBehavior = "auto";

    async function initImmersiveEffects() {
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
        console.warn("Lenis no esta instalado. Instala con: npm i lenis", error);
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

        gsap.fromTo(
          ".gsap-reveal",
          {
            opacity: 0,
            y: 90,
            filter: "blur(16px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power4.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".gsap-zone",
              start: "top 78%",
            },
          }
        );

        gsap.to(".hero-shell", {
          rotateX: 2,
          rotateY: -3,
          scale: 0.985,
          ease: "none",
          scrollTrigger: {
            trigger: "#inicio",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      } catch (error: unknown) {
        console.warn("GSAP no esta instalado. Instala con: npm i gsap", error);
      }
    }

    initImmersiveEffects();

    return () => {
      document.documentElement.style.scrollBehavior = "auto";

      lenisInstance?.destroy?.();

      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeaderCompact(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setActiveProjectImage(project.heroImage);
    setIsProjectViewOpen(true);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseProjectView = () => {
    setIsProjectViewOpen(false);
    setMenuOpen(false);

    requestAnimationFrame(() => {
      document.getElementById("proyectos")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen overflow-x-hidden bg-[#0d0c0a] text-stone-100 selection:bg-[#c8a96b] selection:text-black"
    >
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(200,169,107,0.18),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.06),transparent_20%),linear-gradient(180deg,#0d0c0a_0%,#14110d_46%,#0d0c0a_100%)]" />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.4)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="absolute left-1/2 top-[14%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#d8bd82]/10 blur-[140px]" />
      </div>

      <motion.header
        animate={
          isHeaderCompact
            ? {
                backgroundColor: "rgba(13, 12, 10, 0.78)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }
            : {
                backgroundColor: "rgba(13, 12, 10, 0)",
                borderColor: "rgba(255, 255, 255, 0)",
              }
        }
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-2xl"
      >
        <nav
          className={`mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-all duration-500 sm:px-5 md:px-8 ${
            isHeaderCompact ? "py-3" : "py-4 sm:py-5"
          }`}
        >
          <a
            href={isProjectViewOpen ? "#detalle-proyecto" : "#inicio"}
            onClick={
              isProjectViewOpen
                ? (event) => {
                    event.preventDefault();
                    handleCloseProjectView();
                  }
                : undefined
            }
            className="flex min-w-0 items-center gap-3"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl border border-[#c8a96b]/35 bg-white/5 shadow-lg shadow-black/20">
              <Building2 className="h-5 w-5 text-[#d8bd82]" />
            </span>

            <span className="min-w-0 leading-tight">
              <span className="block truncate text-xs font-semibold tracking-[0.26em] text-stone-200 sm:text-sm sm:tracking-[0.32em]">
                NOVA
              </span>
              <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-stone-500 sm:text-xs sm:tracking-[0.24em]">
                Constructora
              </span>
            </span>
          </a>

          {isProjectViewOpen ? (
            <div className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
              <button
                type="button"
                onClick={handleCloseProjectView}
                className="transition hover:text-[#d8bd82]"
              >
                Volver
              </button>
              <a
                className="transition hover:text-[#d8bd82]"
                href="#detalle-datos"
              >
                Informacion
              </a>
              <a
                className="transition hover:text-[#d8bd82]"
                href="#detalle-galeria"
              >
                Galeria
              </a>
              <a className="transition hover:text-[#d8bd82]" href="#contacto">
                Contacto
              </a>
            </div>
          ) : (
            <div className="hidden items-center gap-8 text-sm text-stone-300 md:flex">
              <a className="transition hover:text-[#d8bd82]" href="#servicios">
                Servicios
              </a>
              <a className="transition hover:text-[#d8bd82]" href="#proyectos">
                Proyectos
              </a>
              <a className="transition hover:text-[#d8bd82]" href="#proceso">
                Proceso
              </a>
              <a className="transition hover:text-[#d8bd82]" href="#contacto">
                Contacto
              </a>
            </div>
          )}

          {isProjectViewOpen ? (
            <Button
              variant="outline"
              className="hidden md:inline-flex"
              onClick={handleCloseProjectView}
            >
              Volver a la landing
            </Button>
          ) : (
            <Button className="hidden md:inline-flex">
              Cotizar obra
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 md:hidden"
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0d0c0a]/95 px-4 py-4 sm:px-5 md:hidden">
            <div className="grid gap-4 text-sm text-stone-300">
              {isProjectViewOpen ? (
                <>
                  <button
                    type="button"
                    onClick={handleCloseProjectView}
                    className="block min-h-11 py-2 text-left"
                  >
                    Volver
                  </button>
                  <a
                    href="#detalle-datos"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Informacion
                  </a>
                  <a
                    href="#detalle-galeria"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Galeria
                  </a>
                  <a
                    href="#contacto"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Contacto
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="#servicios"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Servicios
                  </a>
                  <a
                    href="#proyectos"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Proyectos
                  </a>
                  <a
                    href="#proceso"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Proceso
                  </a>
                  <a
                    href="#contacto"
                    onClick={() => setMenuOpen(false)}
                    className="block min-h-11 py-2"
                  >
                    Contacto
                  </a>
                </>
              )}
            </div>
          </div>
        )}
      </motion.header>

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {isProjectViewOpen ? (
            <ProjectDetailView
              key={`project-${selectedProject.title}`}
              project={selectedProject}
              activeImage={activeProjectImage}
              onImageSelect={setActiveProjectImage}
              onBack={handleCloseProjectView}
            />
          ) : (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
        <section
          id="inicio"
          className="relative min-h-screen px-5 pt-28 sm:pt-32 md:px-8 md:pt-40"
        >
          <motion.div
            style={{ y: heroY, opacity }}
            className="mx-auto grid max-w-7xl items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_.95fr]"
          >
            <div>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#c8a96b]/25 bg-[#c8a96b]/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#e4c98e] sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.28em]"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Ingenieria, diseno y precision
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.1 }}
                className="max-w-4xl text-4xl font-semibold tracking-[-0.07em] text-stone-100 sm:text-5xl md:text-7xl lg:text-8xl"
              >
                Construimos espacios con presencia, orden y caracter.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.2 }}
                className="mt-6 max-w-2xl text-[15px] leading-7 text-stone-400 sm:mt-7 sm:text-base sm:leading-8 md:text-lg"
              >
                Una landing para una constructora que quiere verse solida,
                elegante y clara. Menos ruido visual, mas protagonismo para las
                obras, el proceso y la confianza.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.3 }}
                className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:gap-4"
              >
                <Button className="w-full sm:w-auto">
                  Ver proyectos
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" className="w-full sm:w-auto">
                  Solicitar cotizacion
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.45 }}
                className="mt-10 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6 sm:mt-12 sm:gap-4 sm:pt-8"
              >
                <div>
                  <p className="text-2xl font-semibold text-[#d8bd82] sm:text-3xl">12+</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-stone-500">
                    Anos
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-semibold text-[#d8bd82] sm:text-3xl">80+</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-stone-500">
                    Obras
                  </p>
                </div>

                <div>
                  <p className="text-2xl font-semibold text-[#d8bd82] sm:text-3xl">360</p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-stone-500">
                    Gestion
                  </p>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hero-shell relative h-[340px] overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.035] shadow-2xl shadow-black/50 sm:h-[470px] sm:rounded-[3rem] md:h-[620px] [transform-style:preserve-3d]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(216,189,130,0.2),transparent_35%)]" />

              <ArchitecturalHero />

              <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] border border-white/10 bg-black/30 p-4 backdrop-blur-2xl sm:bottom-5 sm:left-5 sm:right-5 sm:rounded-[2rem] sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#d8bd82] sm:text-sm sm:tracking-[0.25em]">
                      Proyecto destacado
                    </p>
                    <p className="mt-2 text-xl font-semibold sm:text-2xl">Torre Mirador</p>
                  </div>

                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10 sm:h-12 sm:w-12">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <section id="servicios" className="gsap-zone px-5 py-20 sm:py-24 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                  Servicios
                </p>
                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-6xl">
                  Todo lo que una constructora necesita mostrar y controlar.
                </h2>
              </div>

              <p className="max-w-md leading-7 text-stone-400">
                La pagina puede conectarse despues con un panel administrativo
                para clientes, obras, materiales, gastos y avances.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;

                return (
                  <motion.div
                    key={service.title}
                    className="gsap-reveal"
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.35 }}
                    transition={{ duration: 0.65, delay: index * 0.08 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="h-full rounded-[2rem] border border-white/10 bg-white/[0.045] text-stone-100 shadow-xl shadow-black/20 backdrop-blur-xl">
                      <div className="p-6">
                        <div className="mb-8 grid h-[52px] w-[52px] place-items-center rounded-2xl bg-[#d8bd82]/15 text-[#d8bd82]">
                          <Icon className="h-6 w-6" />
                        </div>

                        <h3 className="text-xl font-semibold">
                          {service.title}
                        </h3>
                        <p className="mt-4 leading-7 text-stone-400">
                          {service.text}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="proyectos" className="px-5 py-20 sm:py-24 md:px-8 md:py-28">
          <div className="mx-auto mb-14 max-w-7xl overflow-hidden rounded-[2.2rem] border border-[#d8bd82]/20 bg-black/25 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl sm:mb-20 sm:rounded-[3rem] sm:p-4">
            <div className="relative aspect-[5/6] overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0d0c0a] sm:aspect-[16/10] sm:rounded-[2.4rem] lg:aspect-[16/8]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(216,189,130,0.18),transparent_34%),linear-gradient(120deg,rgba(255,255,255,0.05),transparent)]" />

              <div className="absolute left-4 top-4 z-10 rounded-full border border-[#d8bd82]/25 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[#d8bd82] backdrop-blur-xl sm:left-8 sm:top-8 sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.25em]">
                Recorrido visual
              </div>

              <div className="absolute inset-0">
                <Spline scene="https://prod.spline.design/6H0FFBm04lLFHPVW/scene.splinecode" />
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0c0a] via-[#0d0c0a]/60 to-transparent" />

              <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-10 max-w-2xl rounded-[1.4rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8 sm:rounded-[2rem] sm:p-6">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                  Escena 3D integrada
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.05em] sm:text-2xl md:text-4xl">
                  Una sola pieza interactiva, mas limpia y con mejor foco.
                </h3>
                <p className="mt-3 text-sm leading-6 text-stone-300 sm:text-base sm:leading-7">
                  La tecnologia sigue presente, pero ahora acompana a las obras
                  en lugar de competir con ellas.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                Portafolio
              </p>
              <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-6xl">
                Obras presentadas como experiencias visuales.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-stone-400">
                Haz clic en una obra y se abre una vista amplia con su historia,
                ubicacion, datos clave y galeria.
              </p>
            </div>

            <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
              {projects.map((project, index) => {
                const isActive = selectedProject.title === project.title;

                return (
                  <motion.button
                    key={project.title}
                    type="button"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.75, delay: index * 0.12 }}
                    whileHover={{ y: -8 }}
                    onClick={() => handleProjectSelect(project)}
                    className={`group relative h-[340px] overflow-hidden rounded-[1.8rem] border bg-white/5 text-left transition sm:h-[420px] sm:rounded-[2.2rem] lg:h-[460px] lg:rounded-[2.5rem] ${
                      isActive
                        ? "border-[#d8bd82]/45 shadow-2xl shadow-[#d8bd82]/10"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={project.heroImage}
                      alt={project.title}
                      className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-110 group-hover:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#d8bd82] sm:text-sm sm:tracking-[0.28em]">
                        {project.category}
                      </p>

                      <div className="mt-3 flex items-end justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                            {project.title}
                          </h3>
                          <p className="mt-2 text-sm text-stone-300">
                            {project.location}
                          </p>
                        </div>

                        <span
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full backdrop-blur-xl transition sm:h-11 sm:w-11 ${
                            isActive
                              ? "bg-[#d8bd82] text-black"
                              : "bg-white/10 group-hover:bg-[#d8bd82] group-hover:text-black"
                          }`}
                        >
                          <ArrowUpRight className="h-5 w-5" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="proceso" className="px-5 py-20 sm:py-24 md:px-8 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#d8bd82] sm:text-sm sm:tracking-[0.32em]">
                Proceso
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl md:text-6xl">
                Del primer plano a la entrega final.
              </h2>

              <p className="mt-6 max-w-xl leading-8 text-stone-400">
                La estetica puede ser minimalista, pero el sistema sigue
                comunicando orden: avance, presupuesto, responsables,
                materiales y reportes.
              </p>
            </div>

            <div className="relative rounded-[2.2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[3rem] md:p-8">
              <div className="absolute -inset-1 -z-10 rounded-[3.2rem] bg-gradient-to-br from-[#d8bd82]/20 via-transparent to-white/5 blur-xl" />

              {[
                [
                  "01",
                  "Diagnostico",
                  "Relevamiento, requerimientos y estimacion inicial.",
                ],
                [
                  "02",
                  "Diseno",
                  "Planos, estructura visual y propuesta tecnica.",
                ],
                [
                  "03",
                  "Ejecucion",
                  "Gestion de materiales, personal y cronograma.",
                ],
                [
                  "04",
                  "Entrega",
                  "Reporte final, fotografias, documentacion y garantia.",
                ],
              ].map((step, index) => (
                <motion.div
                  key={step[0]}
                  initial={{ opacity: 0, x: 36 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.65, delay: index * 0.08 }}
                  className="group flex gap-4 border-b border-white/10 py-5 sm:gap-5 sm:py-6 last:border-b-0"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#d8bd82]/25 bg-[#d8bd82]/10 text-sm font-semibold text-[#d8bd82] sm:h-12 sm:w-12">
                    {step[0]}
                  </span>

                  <div>
                    <h3 className="text-xl font-semibold sm:text-2xl">{step[1]}</h3>
                    <p className="mt-2 leading-7 text-stone-400">{step[2]}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="px-5 pb-10 pt-16 sm:pt-20 md:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#d8bd82] text-black shadow-2xl shadow-black/40 sm:rounded-[3rem]">
            <div className="grid gap-8 p-5 sm:p-8 md:p-12 lg:grid-cols-[1.1fr_.9fr] lg:p-16">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/55 sm:text-sm sm:tracking-[0.32em]">
                  Cotizacion
                </p>

                <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.06em] sm:text-4xl md:text-6xl">
                  Convierte visitas en clientes con una pagina que se siente
                  premium y bien resuelta.
                </h2>
              </div>

              <div className="rounded-[1.6rem] bg-black/10 p-5 backdrop-blur-xl sm:rounded-[2rem] sm:p-6">
                <div className="flex items-center gap-3 text-black/70">
                  <MapPin className="h-5 w-5" />
                  <span>Cochabamba, Bolivia</span>
                </div>

                <p className="mt-6 text-lg leading-7 sm:text-xl sm:leading-8">
                  Agenda una visita tecnica, solicita una cotizacion o muestra
                  tus proyectos recientes desde una experiencia clara y elegante.
                </p>

                <Button variant="dark" className="mt-8 w-full sm:w-auto">
                  Iniciar proyecto
                  <Hammer className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
