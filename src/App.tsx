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
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90",
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
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=90",
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
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=2200&q=90",
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
  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=90",
      eyebrow: "Arquitectura residencial",
      title: "Construyendo",
      italic: "tus sueños",
      description:
        "Diseñamos y ejecutamos espacios con presencia, elegancia y una experiencia visual pensada para transmitir confianza desde el primer momento.",
      sideTitle: "Espacios que inspiran",
      sideText:
        "Viviendas, edificios y proyectos comerciales con una estética sobria y contemporánea.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2400&q=90",
      eyebrow: "Diseño y construcción",
      title: "Creamos",
      italic: "valor real",
      description:
        "Cada obra se comunica con claridad: materiales, iluminación, volumen, recorrido y una identidad arquitectónica memorable.",
      sideTitle: "Diseño con carácter",
      sideText:
        "Presentamos cada proyecto como una experiencia visual premium, no solo como una imagen.",
    },
    {
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2400&q=90",
      eyebrow: "Obras comerciales",
      title: "Elevamos",
      italic: "tu proyecto",
      description:
        "Una landing inmersiva para constructoras que quieren mostrar obras, renders, recorridos y avances con impacto profesional.",
      sideTitle: "Arquitectura moderna",
      sideText:
        "Una primera impresión fuerte, elegante y preparada para conectar con futuros clientes.",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => {
      window.clearInterval(interval);
    };
  }, [heroSlides.length]);

  const slide = heroSlides[activeSlide];

  const nextSlide = () => {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setActiveSlide((current) =>
      current === 0 ? heroSlides.length - 1 : current - 1
    );
  };

  return (
  <div className="relative h-full min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.img
          key={slide.image}
          src={slide.image}
          alt={slide.sideTitle}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,8,6,0.22)_0%,rgba(10,8,6,0.24)_26%,rgba(10,8,6,0.58)_66%,rgba(10,8,6,0.88)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(216,189,130,0.28),transparent_24%)]" />

      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75 }}
        className="absolute left-4 top-24 right-4 max-w-[340px] rounded-[1.5rem] border border-white/15 bg-black/20 px-4 py-3 text-sm leading-6 text-stone-100 backdrop-blur-xl sm:left-8 sm:top-30 sm:px-5 sm:py-4 md:left-12 md:top-28"
      >
        Según la visión del proyecto, cada espacio debe sentirse sólido,
        elegante y funcional desde la primera mirada.
      </motion.div>

      <motion.div
        key={`text-${activeSlide}`}
        initial={{ opacity: 0, y: 34 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="absolute bottom-36 left-4 right-4 sm:bottom-32 sm:left-8 sm:right-8 md:bottom-20 md:left-12 md:max-w-5xl lg:bottom-24"
      >
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#e4c98e] sm:text-sm">
          {slide.eyebrow}
        </p>

        <h1 className="mt-4 text-[3.5rem] font-semibold leading-[0.88] tracking-[-0.08em] text-white sm:text-7xl md:text-8xl lg:text-[8.5rem]">
          {slide.title}
          <span className="block [font-family:Georgia,serif] text-[0.86em] italic font-normal tracking-[-0.06em] text-[#f7efe4]">
            {slide.italic}
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-200 sm:text-base sm:leading-8 md:text-lg">
          {slide.description}
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#proyectos"
            className="inline-flex h-[52px] items-center justify-center rounded-full bg-[#f3eee7] px-6 text-base font-medium whitespace-nowrap text-stone-950 transition hover:bg-white sm:px-7"
          >
            Ver proyectos
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>

          <a
            href="#contacto"
            className="inline-flex h-[52px] items-center justify-center rounded-full border border-white/20 bg-white/[0.08] px-6 text-base font-medium whitespace-nowrap text-white backdrop-blur-xl transition hover:bg-white/[0.14] sm:px-7"
          >
            Contactar ahora
          </a>
        </div>
      </motion.div>

      <motion.div
        key={`card-${activeSlide}`}
        initial={{ opacity: 0, x: 34 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.85, delay: 0.12, ease: "easeOut" }}
        className="absolute bottom-4 left-4 right-4 rounded-[1.6rem] border border-white/15 bg-black/30 p-4 backdrop-blur-2xl sm:left-auto sm:right-8 sm:bottom-8 sm:w-[360px] sm:rounded-[2rem] sm:p-6 md:right-12 md:bottom-20"
      >
        <p className="text-[11px] uppercase tracking-[0.26em] text-[#e4c98e]">
          Vista destacada
        </p>

        <h2 className="mt-3 text-2xl font-semibold text-white">
          {slide.sideTitle}
        </h2>

        <p className="mt-2 text-sm leading-6 text-stone-300">
          {slide.sideText}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide
                    ? "w-8 bg-[#d8bd82]"
                    : "w-2.5 bg-white/35 hover:bg-white/60"
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={prevSlide}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-xl transition hover:bg-white/20"
              aria-label="Slide anterior"
            >
              ‹
            </button>

            <button
              type="button"
              onClick={nextSlide}
              className="grid h-10 w-10 place-items-center rounded-full bg-[#f3eee7] text-xl text-black transition hover:bg-white"
              aria-label="Siguiente slide"
            >
              ›
            </button>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 rounded-full bg-[#f3eee7]/88 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-stone-700 shadow-lg shadow-black/15 backdrop-blur md:inline-flex">
        Residencial / Comercial / Supervisión
      </div>
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
          rotateX: 1.4,
          rotateY: -1.6,
          scale: 0.992,
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

      <motion.header className="pointer-events-none fixed left-0 right-0 top-0 z-50">
        <nav
          className={`pointer-events-auto mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 transition-all duration-500 sm:px-5 md:px-8 ${
            isHeaderCompact ? "pt-3 sm:pt-4" : "pt-4 sm:pt-5"
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
            className="relative z-10 flex min-w-0 items-center gap-3"
          >
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold tracking-[0.2em] text-white sm:text-base sm:tracking-[0.24em]">
                DNOI.INC
              </span>
              <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-white/60 sm:text-xs sm:tracking-[0.24em]">
                Constructora
              </span>
            </span>
          </a>

          {isProjectViewOpen ? (
            <div
              className={`absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 rounded-b-[2.3rem] rounded-t-[1.35rem] border px-9 pb-4 pt-3 text-sm font-medium transition-all duration-500 md:flex ${
                isHeaderCompact
                  ? "border-white/14 bg-white/[0.08] text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_18px_65px_rgba(0,0,0,0.2)] backdrop-blur-[26px]"
                  : "border-[#f3eee7] bg-[#f3eee7] text-stone-900 shadow-[0_22px_70px_rgba(0,0,0,0.2)]"
              }`}
            >
              <div
                className={`absolute inset-x-8 top-2 h-px ${
                  isHeaderCompact ? "bg-white/25" : "bg-stone-300/80"
                }`}
              />
              <button
                type="button"
                onClick={handleCloseProjectView}
                className="transition hover:text-[#9a6a42]"
              >
                Volver
              </button>
              <a
                className="transition hover:text-[#9a6a42]"
                href="#detalle-datos"
              >
                Informacion
              </a>
              <a
                className="transition hover:text-[#9a6a42]"
                href="#detalle-galeria"
              >
                Galeria
              </a>
              <a className="transition hover:text-[#9a6a42]" href="#contacto">
                Contacto
              </a>
            </div>
          ) : (
           <div className="absolute left-1/2 top-0 hidden h-[76px] w-[560px] -translate-x-1/2 md:block">
  <svg
    viewBox="0 0 560 76"
    preserveAspectRatio="none"
    className={`absolute inset-0 h-full w-full drop-shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition-all duration-500 ${
      isHeaderCompact ? "opacity-85" : "opacity-100"
    }`}
  >
    <path
      d="M0 0H560C534 0 523 44 480 48H80C37 44 26 0 0 0Z"
      className={`transition-all duration-500 ${
        isHeaderCompact ? "fill-white/15" : "fill-[#f3eee7]"
      }`}
    />
  </svg>

  <div
    className={`relative z-10 flex h-[54px] items-center justify-center gap-10 text-sm font-medium transition-all duration-500 ${
      isHeaderCompact ? "text-white backdrop-blur-xl" : "text-stone-900"
    }`}
  >
    <a className="transition hover:text-[#9a6a42]" href="#servicios">
      Servicios
    </a>
    <a className="transition hover:text-[#9a6a42]" href="#proyectos">
      Proyectos
    </a>
    <a className="transition hover:text-[#9a6a42]" href="#proceso">
      Proceso
    </a>
    <a className="transition hover:text-[#9a6a42]" href="#contacto">
      Contacto
    </a>
  </div>
</div>
          )}

          {isProjectViewOpen ? (
            <button
              type="button"
              onClick={handleCloseProjectView}
              className={`relative z-10 hidden h-[52px] items-center justify-center rounded-full px-6 text-base font-medium transition md:inline-flex ${
                isHeaderCompact
                  ? "border border-white/18 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[24px] hover:bg-white/[0.14]"
                  : "bg-white/10 text-white backdrop-blur-2xl hover:bg-white/[0.16]"
              }`}
            >
              Volver a la landing
            </button>
          ) : (
            <a
              href="#contacto"
              className={`relative z-10 hidden h-[52px] items-center justify-center rounded-full px-6 text-base font-medium transition md:inline-flex ${
                isHeaderCompact
                  ? "border border-white/18 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[24px] hover:bg-white/[0.14]"
                  : "border border-white/35 bg-white/10 text-white backdrop-blur-2xl hover:bg-white/[0.16]"
              }`}
            >
              Cotizar obra
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border transition md:hidden ${
              isHeaderCompact
                ? "border-white/15 bg-white/[0.08] backdrop-blur-xl"
                : "border-white/20 bg-black/20 backdrop-blur-xl"
            }`}
            type="button"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="pointer-events-auto mx-4 mt-3 rounded-[1.8rem] border border-white/10 bg-[#120f0d]/88 px-5 py-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:mx-5 md:hidden">
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
      <section id="inicio" className="relative min-h-screen">
          <motion.div
            style={{ y: heroY, opacity }}
            className="mx-auto w-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
             className="hero-shell relative min-h-screen overflow-hidden bg-[#17120f] [transform-style:preserve-3d]"
            >
              <ArchitecturalHero />
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

