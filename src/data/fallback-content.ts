import type {
  BuildingProject,
  FaqItem,
  ProcessStep,
  RealEstateProperty,
  ServiceItem,
  SiteContent,
  SiteSettings,
  TeamMember,
  TestimonialItem,
  WorkProject,
} from "../types/cms";
import { defaultBusinessPages } from "./business-network";

const settings: SiteSettings = {
  companyName: "Mondoza Construcciones Civiles en General",
  heroEyebrow: "Construccion, arquitectura y remodelacion",
  heroTitle: "Construyendo",
  heroAccent: "tus suenos",
  heroDescription:
    "Desarrollamos construccion, arquitectura, remodelaciones e interiores con seguimiento tecnico y cotizaciones ajustadas al alcance real de cada proyecto.",
  heroImage:
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90",
  tagline: "Construccion, planos, remodelacion e interiores para vivienda, comercio y proyectos a medida.",
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
    slug: "construccion-de-casas-y-edificios",
    title: "Construccion de casas y edificios",
    text: "Ejecutamos proyectos residenciales, comerciales y de edificacion con coordinacion tecnica y control por etapas.",
    description:
      "Desarrollamos proyectos residenciales, comerciales y de edificacion con acompanamiento tecnico desde el alcance inicial hasta la entrega. Organizamos cronograma, presupuesto, supervision y coordinacion de obra para que el cliente tenga una lectura clara del proceso.",
    heroImage:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=2200&q=90",
    ],
    isPriceVisible: false,
    requiresLocation: true,
    leadPrompt:
      "Comparte el tipo de construccion que necesitas, el alcance y marca el punto exacto en el mapa para preparar una cotizacion mas precisa.",
    beforeAfterItems: [],
  },
  {
    id: "srv-2",
    slug: "arquitectura-y-desarrollo-de-planos",
    title: "Arquitectura y desarrollo de planos",
    text: "Trabajamos anteproyectos, planos arquitectonicos, distribucion funcional y documentacion base para construir con claridad.",
    description:
      "Aterrizamos ideas, levantamientos y necesidades del cliente en anteproyectos, planos arquitectonicos y documentacion base para construir con mas orden. El servicio puede partir desde una idea general, una remodelacion o un lote vacio.",
    heroImage:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=2200&q=90",
    ],
    priceLabel: "Desde Bs 450 por m2 referencial",
    isPriceVisible: true,
    requiresLocation: true,
    leadPrompt:
      "Cuentanos si necesitas planos nuevos, regularizacion o rediseno, y marca la ubicacion del predio para revisar mejor el contexto.",
    beforeAfterItems: [],
  },
  {
    id: "srv-3",
    slug: "remodelaciones-y-ampliaciones",
    title: "Remodelaciones y ampliaciones",
    text: "Intervenimos viviendas, oficinas y locales existentes para renovar espacios, ampliar areas y mejorar su funcionamiento.",
    description:
      "Renovamos ambientes existentes, ampliamos areas y mejoramos la funcionalidad de viviendas, oficinas y locales. Este servicio esta pensado para clientes que quieren visualizar mejor el antes y despues de la intervencion y dejar una solicitud bien enfocada.",
    heroImage:
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=2200&q=90",
    ],
    isPriceVisible: false,
    requiresLocation: true,
    leadPrompt:
      "Describe que ambiente quieres remodelar, que problema quieres resolver y marca el punto exacto para poder evaluar la intervencion.",
    beforeAfterItems: [
      {
        id: "srv-3-compare-1",
        title: "Cocina integral",
        beforeImage:
          "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=90",
        afterImage:
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=90",
      },
      {
        id: "srv-3-compare-2",
        title: "Sala renovada",
        beforeImage:
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=90",
        afterImage:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=90",
      },
    ],
  },
  {
    id: "srv-4",
    slug: "interiores-y-acabados",
    title: "Interiores y acabados",
    text: "Desarrollamos propuestas de interiorismo, materiales, revestimientos y detalles finales para elevar la experiencia del espacio.",
    description:
      "Definimos materiales, revestimientos, mobiliario fijo y acabados para elevar la experiencia final del espacio. El enfoque combina criterio estetico con soluciones constructivas pensadas para obra real.",
    heroImage:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90",
    ],
    isPriceVisible: false,
    requiresLocation: false,
    leadPrompt:
      "Comparte el tipo de ambiente, estilo o necesidad de acabados para prepararte una propuesta inicial.",
    beforeAfterItems: [],
  },
  {
    id: "srv-5",
    slug: "supervision-tecnica-de-obra",
    title: "Supervision tecnica de obra",
    text: "Hacemos seguimiento de avances, control de calidad, coordinacion de obra y resolucion tecnica durante la ejecucion.",
    description:
      "Acompanamos la ejecucion con seguimiento tecnico, control de calidad y coordinacion de decisiones en campo. Ideal para clientes que ya iniciaron obra y necesitan una lectura tecnica mas constante.",
    heroImage:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=2200&q=90",
    ],
    isPriceVisible: false,
    requiresLocation: true,
    leadPrompt:
      "Indica el avance actual de la obra y marca su ubicacion para entender mejor el contexto del seguimiento tecnico.",
    beforeAfterItems: [],
  },
  {
    id: "srv-6",
    slug: "presupuestos-y-cotizaciones",
    title: "Presupuestos y cotizaciones",
    text: "Revisamos planos, ideas iniciales o requerimientos del cliente para preparar cotizaciones claras segun el alcance del proyecto.",
    description:
      "Ordenamos informacion, planos y requerimientos para construir un presupuesto mas claro segun el alcance real del proyecto. Puede ser el punto de entrada cuando el cliente aun no define por completo el servicio final.",
    heroImage:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=2200&q=90",
    ],
    isPriceVisible: false,
    requiresLocation: false,
    leadPrompt:
      "Cuentanos si ya tienes planos, medidas o una idea base para orientarte con la cotizacion inicial.",
    beforeAfterItems: [],
  },
];

const processSteps: ProcessStep[] = [
  {
    id: "process-1",
    order: "01",
    title: "Diagnostico y alcance",
    text: "Revisamos necesidades, planos, medidas y objetivos para definir una ruta tecnica clara desde el inicio.",
  },
  {
    id: "process-2",
    order: "02",
    title: "Propuesta y cotizacion",
    text: "Armamos la propuesta de trabajo, el presupuesto y la estrategia de desarrollo segun el tipo de servicio.",
  },
  {
    id: "process-3",
    order: "03",
    title: "Ejecucion y supervision",
    text: "Desarrollamos la obra o intervencion con seguimiento tecnico, control de calidad y acompanamiento continuo.",
  },
  {
    id: "process-4",
    order: "04",
    title: "Entrega y cierre",
    text: "Cerramos con orden, revision final y acompanamiento para dejar el proyecto listo para su uso.",
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

const properties: RealEstateProperty[] = [
  {
    id: "property-1",
    slug: "casa-jardin-norte",
    title: "Casa Jardin Norte",
    category: "Casa",
    operation: "venta",
    status: "disponible",
    location: "Tiquipaya, Cochabamba",
    price: "USD 185.000",
    area: "320 m2",
    bedrooms: 4,
    bathrooms: 3,
    summary: "Casa familiar con jardin, parqueo y salida rapida al mercado.",
    description:
      "Propiedad residencial pensada para familias que buscan amplitud, jardin privado y una ubicacion tranquila con acceso comodo a la ciudad.",
    heroImage:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2200&q=90",
    ],
    features: ["Jardin", "Parqueo para 2 vehiculos", "Suite principal", "Area social"],
    mapEmbedUrl: "https://www.google.com/maps?q=Tiquipaya%20Cochabamba&output=embed",
  },
  {
    id: "property-2",
    slug: "departamento-equipetrol",
    title: "Departamento Equipetrol",
    category: "Departamento",
    operation: "alquiler",
    status: "disponible",
    location: "Equipetrol, Santa Cruz",
    price: "USD 950 / mes",
    area: "118 m2",
    bedrooms: 3,
    bathrooms: 2,
    summary: "Departamento ejecutivo con terraza y acceso a zonas comerciales.",
    description:
      "Opcion ideal para alquiler ejecutivo, con buena ubicacion, distribucion practica y presentacion lista para comercializacion inmediata.",
    heroImage:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90",
    gallery: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90",
    ],
    features: ["Terraza", "Seguridad 24/7", "Parqueo", "Zona comercial cercana"],
    mapEmbedUrl: "https://www.google.com/maps?q=Equipetrol%20Santa%20Cruz&output=embed",
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
    question: "Que servicios ofrece Mondoza actualmente?",
    answer:
      "Ofrecemos construccion, arquitectura, desarrollo de planos, remodelaciones, interiores, supervision tecnica y cotizaciones para proyectos residenciales y comerciales.",
  },
  {
    id: "faq-2",
    question: "Pueden cotizar desde planos iniciales o una idea base?",
    answer:
      "Si. Podemos revisar planos preliminares, referencias, medidas o una idea inicial para orientar una cotizacion acorde al alcance real del proyecto.",
  },
  {
    id: "faq-3",
    question: "Tambien trabajan remodelaciones parciales e interiores?",
    answer:
      "Si. Podemos intervenir espacios puntuales, remodelaciones integrales, redistribuciones, acabados e interiores segun la necesidad del cliente.",
  },
  {
    id: "faq-4",
    question: "Como manejan el seguimiento y la cotizacion del proyecto?",
    answer:
      "Organizamos el trabajo por etapas, revisamos el alcance tecnico y presentamos una cotizacion clara para luego avanzar con seguimiento y comunicacion constante.",
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
  properties,
  team,
  testimonials,
  faqs,
  businessPages: defaultBusinessPages,
};
