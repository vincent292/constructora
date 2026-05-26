import type { FaqItem, ProcessStep, ServiceItem } from "../types/cms";

export type BusinessSlug = "constructora" | "juridico" | "bienes-raices";

export type GatewayArea = {
  slug: BusinessSlug;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  image: string;
  bullets: string[];
};

export type BusinessAreaContent = {
  slug: BusinessSlug;
  label: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  image: string;
  tagline: string;
  coverage: string;
  coverageDescription: string;
  primaryLabel: string;
  secondaryLabel: string;
  services: ServiceItem[];
  highlights: { id: string; title: string; text: string }[];
  process: ProcessStep[];
  faqs: FaqItem[];
  contactPrompt: string;
  footerBlurb: string;
};

export const gatewayAreas: GatewayArea[] = [
  {
    slug: "constructora",
    eyebrow: "Constructora",
    title: "Obras, arquitectura y remodelaciones",
    description:
      "La unidad que ya impulsa obras, edificios, planos, interiores y cotizaciones a medida.",
    detail: "Ideal para clientes que buscan construir, ampliar, remodelar o desarrollar.",
    image:
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1800&q=90",
    bullets: [
      "Construccion de casas y edificios",
      "Arquitectura, planos e interiores",
      "Supervision y seguimiento de obra",
    ],
  },
  {
    slug: "juridico",
    eyebrow: "Estudio juridico",
    title: "Soporte legal para proyectos y patrimonio",
    description:
      "Asesoria enfocada en contratos, permisos, regularizacion documental y conflictos ligados a construccion e inmuebles.",
    detail: "Pensado para clientes que necesitan respaldo legal claro antes, durante o despues del proyecto.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1800&q=90",
    bullets: [
      "Contratos, minutas y respaldo documental",
      "Permisos, regularizacion y tramites",
      "Acompanamiento legal inmobiliario",
    ],
  },
  {
    slug: "bienes-raices",
    eyebrow: "Bienes raices",
    title: "Comercializacion y gestion inmobiliaria",
    description:
      "Captacion, promocion y acompanamiento comercial para inmuebles, desarrollos y oportunidades de inversion.",
    detail: "Enfocado en propietarios, compradores, inversionistas y desarrollos con salida comercial.",
    image:
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1800&q=90",
    bullets: [
      "Captacion y promocion de inmuebles",
      "Acompanamiento para compra y venta",
      "Soporte comercial para desarrollos",
    ],
  },
];

export const networkHighlights = [
  {
    id: "network-1",
    title: "Una landing madre",
    text: "La portada principal ordena la marca y deriva a cada unidad segun lo que necesita el cliente.",
  },
  {
    id: "network-2",
    title: "Verticales conectadas",
    text: "Constructora, juridico y bienes raices se presentan por separado, pero con narrativa y confianza compartida.",
  },
  {
    id: "network-3",
    title: "CMS por especialidad",
    text: "La siguiente etapa puede separar accesos y roles para que cada equipo gestione solo su propio contenido.",
  },
];

export const businessAreas: Record<Exclude<BusinessSlug, "constructora">, BusinessAreaContent> =
  {
    juridico: {
      slug: "juridico",
      label: "Estudio juridico",
      eyebrow: "Asesoria legal especializada",
      title: "Respaldo",
      accent: "legal",
      description:
        "Acompanamos contratos, regularizacion, permisos y decisiones legales vinculadas a construccion, patrimonio e inmuebles.",
      image:
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=2400&q=90",
      tagline:
        "Un frente juridico enfocado en construir con respaldo documental y tomar decisiones con menor riesgo.",
      coverage: "Bolivia",
      coverageDescription:
        "Atendemos consultas de proyectos, inmuebles, tramites y soporte legal ligado a obra, patrimonio y contratos.",
      primaryLabel: "Ver servicios legales",
      secondaryLabel: "Solicitar asesoria",
      services: [
        {
          id: "legal-1",
          title: "Contratos y respaldo documental",
          text: "Redactamos y revisamos contratos, minutas, compromisos y documentos clave para obras e inmuebles.",
        },
        {
          id: "legal-2",
          title: "Permisos y tramites",
          text: "Acompanamos procesos de licencias, requisitos municipales, observaciones y gestiones vinculadas al proyecto.",
        },
        {
          id: "legal-3",
          title: "Regularizacion de propiedad",
          text: "Apoyamos saneamiento, documentacion, antecedentes y orden legal para inmuebles con observaciones.",
        },
        {
          id: "legal-4",
          title: "Asesoria legal inmobiliaria",
          text: "Revisamos riesgos, negociaciones y estructura legal de operaciones ligadas a compra, venta o desarrollo.",
        },
        {
          id: "legal-5",
          title: "Prevencion y manejo de conflictos",
          text: "Ayudamos a anticipar contingencias y a ordenar la estrategia frente a disputas documentales o contractuales.",
        },
        {
          id: "legal-6",
          title: "Acompanamiento continuo",
          text: "Podemos seguir el caso por etapas para que el cliente tenga soporte claro durante todo el proceso.",
        },
      ],
      highlights: [
        {
          id: "legal-highlight-1",
          title: "Enfoque conectado al proyecto",
          text: "La asesoria juridica no se presenta aislada, sino articulada con obra, propiedad y decisiones reales del cliente.",
        },
        {
          id: "legal-highlight-2",
          title: "Menos friccion operativa",
          text: "Ordenar contratos, permisos y documentacion desde el inicio evita atrasos y reduce puntos ciegos.",
        },
        {
          id: "legal-highlight-3",
          title: "Mejor lectura del riesgo",
          text: "Cada consulta busca traducir lo legal en decisiones comprensibles para el cliente y el equipo.",
        },
      ],
      process: [
        {
          id: "legal-process-1",
          order: "01",
          title: "Revision del caso",
          text: "Leemos el contexto, la etapa del proyecto y el tipo de documento o conflicto a revisar.",
        },
        {
          id: "legal-process-2",
          order: "02",
          title: "Diagnostico y ruta",
          text: "Definimos alcance, riesgos, pendientes y estrategia legal segun la necesidad concreta del cliente.",
        },
        {
          id: "legal-process-3",
          order: "03",
          title: "Gestion y seguimiento",
          text: "Avanzamos en documentos, tramites o acompanamiento con comunicacion clara durante el proceso.",
        },
        {
          id: "legal-process-4",
          order: "04",
          title: "Cierre y continuidad",
          text: "Entregamos el resultado y dejamos lista la base documental para la siguiente decision o etapa.",
        },
      ],
      faqs: [
        {
          id: "legal-faq-1",
          question: "El estudio juridico solo atiende temas de construccion?",
          answer:
            "Su enfoque principal esta relacionado con construccion, inmuebles, contratos, permisos y respaldo patrimonial vinculado a proyectos y propiedad.",
        },
        {
          id: "legal-faq-2",
          question: "Pueden revisar documentos antes de firmar?",
          answer:
            "Si. Podemos revisar contratos, minutas y documentacion previa para detectar riesgos, observaciones y puntos de mejora.",
        },
        {
          id: "legal-faq-3",
          question: "Tambien ayudan con regularizacion de inmuebles?",
          answer:
            "Si. Podemos orientar procesos de saneamiento, antecedentes documentales y orden legal de la propiedad segun el caso.",
        },
        {
          id: "legal-faq-4",
          question: "La asesoria puede coordinarse con la constructora?",
          answer:
            "Si. Esa es precisamente una de las ventajas del ecosistema: legal, obra e inmobiliario pueden conversar con mas claridad.",
        },
      ],
      contactPrompt:
        "Si necesitas respaldo legal para un proyecto, un inmueble o una decision contractual, podemos revisar tu caso y orientarte.",
      footerBlurb:
        "Asesoria legal conectada a construccion, inmuebles, contratos y patrimonio.",
    },
    "bienes-raices": {
      slug: "bienes-raices",
      label: "Bienes raices",
      eyebrow: "Gestion inmobiliaria",
      title: "Oportunidades",
      accent: "inmobiliarias",
      description:
        "Acompanamos captacion, comercializacion y lectura comercial de inmuebles y desarrollos con una presentacion mas clara del producto.",
      image:
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2400&q=90",
      tagline:
        "Una unidad enfocada en compra, venta, captacion y soporte comercial para propiedades y desarrollos.",
      coverage: "Bolivia",
      coverageDescription:
        "Trabajamos propiedades residenciales, comerciales y proyectos con enfoque de captacion, venta y acompanamiento.",
      primaryLabel: "Explorar el servicio",
      secondaryLabel: "Solicitar orientacion",
      services: [
        {
          id: "real-1",
          title: "Captacion de inmuebles",
          text: "Organizamos la entrada de propiedades y levantamos la informacion clave para presentarlas con mayor claridad.",
        },
        {
          id: "real-2",
          title: "Compra y venta asistida",
          text: "Acompanamos a propietarios y compradores durante la negociacion y la lectura comercial de cada oportunidad.",
        },
        {
          id: "real-3",
          title: "Comercializacion de desarrollos",
          text: "Apoyamos edificios y proyectos con discurso comercial, tipologias claras y mejor lectura del inventario.",
        },
        {
          id: "real-4",
          title: "Perfilamiento de inversion",
          text: "Ayudamos a ordenar opciones y prioridades para clientes que buscan invertir o evaluar retorno inmobiliario.",
        },
        {
          id: "real-5",
          title: "Soporte documental coordinado",
          text: "Cuando hace falta, articulamos el trabajo con el frente juridico para reducir fricciones documentales.",
        },
        {
          id: "real-6",
          title: "Seguimiento comercial",
          text: "Mantenemos trazabilidad de consultas, interes, disponibilidad y siguientes pasos con cada prospecto.",
        },
      ],
      highlights: [
        {
          id: "real-highlight-1",
          title: "Mas claridad para vender",
          text: "Una mejor presentacion del activo ayuda a que el cliente entienda valor, ubicacion, disponibilidad y potencial.",
        },
        {
          id: "real-highlight-2",
          title: "Puente entre obra y mercado",
          text: "La relacion con la constructora permite explicar mejor desarrollos y propiedades con respaldo tecnico.",
        },
        {
          id: "real-highlight-3",
          title: "Flujo coordinado",
          text: "Capacidad comercial, soporte documental y seguimiento pueden integrarse dentro del mismo ecosistema.",
        },
      ],
      process: [
        {
          id: "real-process-1",
          order: "01",
          title: "Revision del inmueble",
          text: "Levantamos datos, contexto comercial y objetivos del propietario o del desarrollo.",
        },
        {
          id: "real-process-2",
          order: "02",
          title: "Posicionamiento y oferta",
          text: "Definimos narrativa, presentacion y estrategia de salida segun el tipo de activo.",
        },
        {
          id: "real-process-3",
          order: "03",
          title: "Prospeccion y seguimiento",
          text: "Ordenamos consultas, filtramos interes y acompanamos cada oportunidad con trazabilidad.",
        },
        {
          id: "real-process-4",
          order: "04",
          title: "Cierre coordinado",
          text: "Alineamos los siguientes pasos comerciales y, cuando corresponde, articulamos soporte documental.",
        },
      ],
      faqs: [
        {
          id: "real-faq-1",
          question: "Solo trabajaran desarrollos propios o tambien propiedades externas?",
          answer:
            "La estructura esta pensada para ambas opciones: propiedades externas, inmuebles captados y desarrollos ligados al grupo.",
        },
        {
          id: "real-faq-2",
          question: "Pueden coordinar con el frente juridico?",
          answer:
            "Si. Cuando un caso lo necesita, la gestion comercial puede apoyarse en el estudio juridico para ordenar documentacion o validaciones.",
        },
        {
          id: "real-faq-3",
          question: "Tambien pueden mostrar inventario de edificios?",
          answer:
            "Si. Esta vertical puede servir para comercializar unidades, tipologias y disponibilidad de desarrollos conectados a la constructora.",
        },
        {
          id: "real-faq-4",
          question: "Ya incluye un portal completo de propiedades?",
          answer:
            "Por ahora arranca como landing comercial y se puede escalar luego a un catalogo o CMS propio de propiedades.",
        },
      ],
      contactPrompt:
        "Si quieres mover un inmueble, presentar mejor un desarrollo o recibir orientacion comercial, podemos ayudarte a estructurarlo.",
      footerBlurb:
        "Gestion inmobiliaria conectada a desarrollo, comercializacion y acompanamiento documental.",
    },
  };
