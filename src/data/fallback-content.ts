import type {
  BuildingProject,
  ServiceItem,
  SiteContent,
  SiteSettings,
  TeamMember,
  WorkProject,
} from "../types/cms";

const settings: SiteSettings = {
  companyName: "Mondoza Construcciones Civiles en General",
  heroEyebrow: "Constructora premium en Bolivia",
  heroTitle: "Construyendo",
  heroAccent: "tus suenos",
  heroDescription:
    "Obras, edificios, avances, planos, unidades disponibles y solicitudes de cotizacion desde una sola plataforma visual y administrable.",
  heroImage:
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90",
  tagline: "Arquitectura, ejecucion y control con una experiencia elegante.",
  location: "Cochabamba, Bolivia",
  contact: {
    phone: "+591 70000000",
    whatsapp: "+591 70000000",
    email: "contacto@mondozaconstrucciones.com",
    address: "Cochabamba, Bolivia",
  },
};

const services: ServiceItem[] = [
  {
    id: "srv-1",
    title: "Ejecucion integral de obras",
    text: "Planificacion, construccion y seguimiento completo de proyectos residenciales, comerciales y urbanos.",
  },
  {
    id: "srv-2",
    title: "Desarrollo de edificios",
    text: "Gestion de torres, departamentos, disponibilidad por unidad y presentacion comercial del proyecto.",
  },
  {
    id: "srv-3",
    title: "Supervision y avances",
    text: "Control de obra, registro fotografico, hitos de avance, entregas y documentacion tecnica.",
  },
  {
    id: "srv-4",
    title: "Cotizaciones y leads",
    text: "Recepcion de solicitudes desde la web y seguimiento comercial centralizado para el equipo.",
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
      },
      {
        id: "update-2",
        title: "Muros y estructura principal",
        date: "2026-03-25",
        summary: "La volumetria principal ya puede revisarse visualmente en recorridos y fotografias.",
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

export const fallbackContent: SiteContent = {
  settings,
  services,
  works,
  buildings,
  team,
};
