import type {
  BuildingProject,
  FaqItem,
  ProcessStep,
  ServiceItem,
  SiteContent,
  SiteSettings,
  TeamMember,
  TestimonialItem,
  WorkProject,
} from "../types/cms";

const settings: SiteSettings = {
  companyName: "Mondoza Construcciones Civiles en General",
  heroEyebrow: "Construccion civil y edificacion",
  heroTitle: "Construyendo",
  heroAccent: "tus suenos",
  heroDescription:
    "Ejecutamos obras civiles, edificios y proyectos residenciales con seguimiento tecnico, criterio constructivo y atencion cercana en cada etapa.",
  heroImage:
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90",
  tagline: "Soluciones constructivas para vivienda, comercio y desarrollo inmobiliario.",
  location: "Cochabamba y Santa Cruz, Bolivia",
  contact: {
    phone: "+591 70000000",
    whatsapp: "+591 70000000",
    email: "contacto@mondozaconstrucciones.com",
    address: "Cochabamba, Bolivia",
    branches: [
      {
        id: "branch-1",
        name: "Sucursal Cochabamba",
        address: "Av. America Oeste, Cochabamba, Bolivia",
        phone: "+591 70000000",
      },
      {
        id: "branch-2",
        name: "Sucursal Santa Cruz",
        address: "Equipetrol Norte, Santa Cruz, Bolivia",
        phone: "+591 71000000",
      },
    ],
  },
  processSteps: [],
  testimonials: [],
  faqs: [],
};

const services: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Ejecucion integral de obras",
    text: "Planificacion, construccion y control de obras residenciales, comerciales e institucionales.",
  },
  {
    id: "srv-2",
    title: "Desarrollo de edificios",
    text: "Ejecucion de edificios multifamiliares y desarrollos verticales con lectura clara de unidades y tipologias.",
  },
  {
    id: "srv-3",
    title: "Supervision y avances",
    text: "Seguimiento tecnico, control de calidad, registro de avances y coordinacion en obra.",
  },
  {
    id: "srv-4",
    title: "Remodelacion y ampliacion",
    text: "Intervenimos viviendas, locales y espacios existentes con soluciones funcionales y buen criterio constructivo.",
  },
];

const processSteps: ProcessStep[] = [
  {
    id: "process-1",
    order: "01",
    title: "Planificacion",
    text: "Estudiamos el alcance del proyecto, el presupuesto y la estrategia constructiva.",
  },
  {
    id: "process-2",
    order: "02",
    title: "Ejecucion",
    text: "Desarrollamos la obra con control tecnico, coordinacion en campo y seguimiento continuo.",
  },
  {
    id: "process-3",
    order: "03",
    title: "Supervision",
    text: "Cuidamos calidad, tiempos, avances y resolucion de detalles durante cada etapa.",
  },
  {
    id: "process-4",
    order: "04",
    title: "Entrega",
    text: "Cerramos con orden, documentacion y acompanamiento para la puesta en marcha del proyecto.",
  },
];

const works: WorkProject[] = [
  {
    id: "work-1",
    slug: "casa-piedra-norte",
    title: "Casa Piedra Norte",
    category: "Obra residencial",
    location: "Tiquipaya, Cochabamba",
    year: "2025",
    area: "620 m2",
    status: "en_progreso",
    clientName: "Familia Camacho",
    ownerName: "Mondoza Construcciones",
    summary:
      "Residencia contemporanea con piedra, patios y una lectura espacial sobria.",
    description:
      "Una obra privada con fuerte protagonismo de materiales nobles, control de detalles y actualizaciones pensadas para mostrar confianza al cliente final.",
    heroImage:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=90",
    ],
    planFiles: ["Planta baja", "Planta alta", "Cortes arquitectonicos"],
    metrics: [
      { label: "Cliente", value: "Familia Camacho" },
      { label: "Estado", value: "En progreso" },
      { label: "Entrega", value: "Segundo semestre 2026" },
      { label: "Supervision", value: "Semanal" },
    ],
    updates: [
      {
        id: "update-1",
        title: "Cimentacion terminada",
        date: "2026-02-18",
        summary: "Se completo la base estructural y se cerro el primer control de calidad.",
        performedBy: "Ing. Pablo Quiroga",
        photos: [
          "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=90",
        ],
      },
      {
        id: "update-2",
        title: "Muros y estructura principal",
        date: "2026-03-25",
        summary: "La volumetria principal ya puede revisarse visualmente en recorridos y fotografias.",
        performedBy: "Arq. Daniela Rojas",
        photos: [
          "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=90",
          "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=1600&q=90",
        ],
      },
    ],
    mapEmbedUrl:
      "https://www.google.com/maps?q=Cochabamba%20Bolivia&output=embed",
  },
  {
    id: "work-2",
    slug: "centro-empresarial-nova",
    title: "Centro Empresarial Nova",
    category: "Obra comercial",
    location: "Equipetrol, Santa Cruz",
    year: "2024",
    area: "6.850 m2",
    status: "finalizado",
    clientName: "Nova Group",
    ownerName: "Mondoza Construcciones",
    summary:
      "Volumen corporativo de lectura nitida, acceso sobrio y presencia institucional.",
    description:
      "Proyecto comercial pensado para mostrar solidez de marca, experiencia de acceso y ejecucion integral con documentacion organizada.",
    heroImage:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=2200&q=90",
    ],
    planFiles: ["Masterplan comercial", "Fachada principal", "Lobby corporativo"],
    metrics: [
      { label: "Cliente", value: "Nova Group" },
      { label: "Estado", value: "Finalizado" },
      { label: "Entrega", value: "2024" },
      { label: "Programa", value: "Oficinas + retail" },
    ],
    updates: [
      {
        id: "update-3",
        title: "Entrega final",
        date: "2024-11-09",
        summary: "Se entregaron planos finales, fotografias y documentacion de cierre del proyecto.",
        performedBy: "Ing. Marcelo Mondoza",
        photos: [
          "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=90",
        ],
      },
    ],
    mapEmbedUrl:
      "https://www.google.com/maps?q=Santa%20Cruz%20Bolivia&output=embed",
  },
];

const buildings: BuildingProject[] = [
  {
    id: "building-1",
    slug: "torre-mirador",
    title: "Torre Mirador",
    category: "Edificio residencial",
    location: "Zona Norte, Cochabamba",
    year: "2026",
    area: "4.200 m2",
    status: "en_progreso",
    clientName: "Mirador Desarrollos",
    ownerName: "Mondoza Construcciones",
    summary:
      "Edificio pensado para comunicar presencia, orden y disponibilidad clara de unidades.",
    description:
      "La experiencia del edificio combina comercializacion de departamentos, avances de obra, datos tecnicos y recorrido visual por unidad disponible.",
    heroImage:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90",
    ],
    planFiles: ["https://example.com/planos/torre-mirador-planta-tipica.pdf"],
    metrics: [
      { label: "Unidades", value: "28 departamentos" },
      { label: "Estado", value: "En progreso" },
      { label: "Entrega", value: "2026" },
      { label: "Modalidad", value: "Venta directa" },
    ],
    amenities: ["Lobby doble altura", "Terraza social", "Parqueos", "Seguridad 24/7"],
    units: [
      {
        id: "unit-1",
        title: "Departamento 2H",
        bedrooms: 2,
        bathrooms: 2,
        area: "84 m2",
        floorLabel: "Pisos 4 y 5",
        price: "USD 89.000",
        isAvailable: true,
      },
      {
        id: "unit-2",
        title: "Departamento 3H",
        bedrooms: 3,
        bathrooms: 3,
        area: "112 m2",
        floorLabel: "Piso 8",
        price: "USD 118.000",
        isAvailable: true,
      },
      {
        id: "unit-3",
        title: "Penthouse",
        bedrooms: 4,
        bathrooms: 4,
        area: "180 m2",
        floorLabel: "Piso 12",
        price: "Reservado",
        isAvailable: false,
      },
    ],
    mapEmbedUrl:
      "https://www.google.com/maps?q=Cochabamba%20Bolivia&output=embed",
  },
];

const team: TeamMember[] = [
  {
    id: "team-1",
    name: "Ing. Marcelo Mondoza",
    role: "Director general",
    bio: "Lidera la estrategia de obra, relacion comercial y la vision integral de la empresa.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: "team-2",
    name: "Arq. Daniela Rojas",
    role: "Gerencia de proyectos",
    bio: "Coordina arquitectura, avances visuales, documentacion y experiencia de presentacion para clientes.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=90",
  },
  {
    id: "team-3",
    name: "Ing. Pablo Quiroga",
    role: "Jefe de obra",
    bio: "Controla cronogramas, calidad, seguridad y seguimiento de hitos constructivos en campo.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=90",
  },
];

const testimonials: TestimonialItem[] = [
  {
    id: "testimonial-1",
    name: "Carla Camacho",
    role: "Cliente residencial",
    company: "Familia Camacho",
    quote:
      "Valoramos mucho el orden del proceso, la claridad en los avances y la forma en que el equipo resolvio detalles durante toda la obra.",
  },
  {
    id: "testimonial-2",
    name: "Jorge Nova",
    role: "Director comercial",
    company: "Nova Group",
    quote:
      "La ejecucion fue seria y bien coordinada. Tuvimos seguimiento claro, buena comunicacion y una entrega consistente con lo proyectado.",
  },
  {
    id: "testimonial-3",
    name: "Daniela Ortega",
    role: "Propietaria",
    company: "Villa Jardin Sur",
    quote:
      "Nos dio confianza ver planos, decisiones y avances con una presentacion ordenada. Se noto experiencia y criterio constructivo.",
  },
];

const faqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Que tipo de proyectos desarrolla Mondoza?",
    answer:
      "Trabajamos obras residenciales, comerciales, edificios y ampliaciones con seguimiento tecnico, coordinacion en obra y control de avances.",
  },
  {
    id: "faq-2",
    question: "Pueden cotizar una obra desde planos iniciales?",
    answer:
      "Si. Podemos revisar planos preliminares, programa, ubicacion y alcance para orientar una cotizacion inicial o una etapa de presupuesto mas precisa.",
  },
  {
    id: "faq-3",
    question: "Como se realiza el seguimiento de una obra?",
    answer:
      "El seguimiento se organiza por hitos, avances, registro fotografico, responsables y comunicacion constante segun el tipo de proyecto.",
  },
  {
    id: "faq-4",
    question: "Tambien manejan edificios con unidades disponibles?",
    answer:
      "Si. Podemos mostrar tipologias, disponibilidad, amenidades, planos y datos clave de cada unidad dentro del desarrollo.",
  },
];

export const fallbackContent: SiteContent = {
  settings: {
    ...settings,
    processSteps,
    testimonials,
    faqs,
  },
  services,
  works,
  buildings,
  team,
  testimonials,
  faqs,
};
