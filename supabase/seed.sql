delete from public.site_settings;

insert into public.site_settings (
  id,
  company_name,
  hero_eyebrow,
  hero_title,
  hero_accent,
  hero_description,
  hero_image,
  tagline,
  location,
  contact,
  testimonials,
  faqs
)
values (
  '00000000-0000-0000-0000-000000000001',
  'Mondoza Construcciones Civiles en General',
  'Construccion civil y edificacion',
  'Construyendo',
  'tus suenos',
  'Ejecutamos obras civiles, edificios y proyectos residenciales con seguimiento tecnico, criterio constructivo y atencion cercana en cada etapa.',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=2400&q=90',
  'Soluciones constructivas para vivienda, comercio y desarrollo inmobiliario.',
  'Cochabamba y Santa Cruz, Bolivia',
  '{"phone":"+591 70000000","whatsapp":"+591 70000000","email":"contacto@mondozaconstrucciones.com","address":"Cochabamba, Bolivia","branches":[{"id":"branch-1","name":"Sucursal Cochabamba","address":"Av. America Oeste, Cochabamba, Bolivia","phone":"+591 70000000"},{"id":"branch-2","name":"Sucursal Santa Cruz","address":"Equipetrol Norte, Santa Cruz, Bolivia","phone":"+591 71000000"}]}'::jsonb,
  '[{"id":"testimonial-1","name":"Carla Camacho","role":"Cliente residencial","company":"Familia Camacho","quote":"Valoramos mucho el orden del proceso, la claridad en los avances y la forma en que el equipo resolvio detalles durante toda la obra."},{"id":"testimonial-2","name":"Jorge Nova","role":"Director comercial","company":"Nova Group","quote":"La ejecucion fue seria y bien coordinada. Tuvimos seguimiento claro, buena comunicacion y una entrega consistente con lo proyectado."},{"id":"testimonial-3","name":"Daniela Ortega","role":"Propietaria","company":"Villa Jardin Sur","quote":"Nos dio confianza ver planos, decisiones y avances con una presentacion ordenada. Se noto experiencia y criterio constructivo."}]'::jsonb,
  '[{"id":"faq-1","question":"Que tipo de proyectos desarrolla Mondoza?","answer":"Trabajamos obras residenciales, comerciales, edificios y ampliaciones con seguimiento tecnico, coordinacion en obra y control de avances."},{"id":"faq-2","question":"Pueden cotizar una obra desde planos iniciales?","answer":"Si. Podemos revisar planos preliminares, programa, ubicacion y alcance para orientar una cotizacion inicial o una etapa de presupuesto mas precisa."},{"id":"faq-3","question":"Como se realiza el seguimiento de una obra?","answer":"El seguimiento se organiza por hitos, avances, registro fotografico, responsables y comunicacion constante segun el tipo de proyecto."},{"id":"faq-4","question":"Tambien manejan edificios con unidades disponibles?","answer":"Si. Podemos mostrar tipologias, disponibilidad, amenidades, planos y datos clave de cada unidad dentro del desarrollo."}]'::jsonb
);

insert into public.services (id, title, text, display_order)
values
  ('00000000-0000-0000-0000-000000000101', 'Ejecucion integral de obras', 'Planificacion, construccion y control de obras residenciales, comerciales e institucionales.', 1),
  ('00000000-0000-0000-0000-000000000102', 'Desarrollo de edificios', 'Ejecucion de edificios multifamiliares y desarrollos verticales con lectura clara de unidades y tipologias.', 2),
  ('00000000-0000-0000-0000-000000000103', 'Supervision y avances', 'Seguimiento tecnico, control de calidad, registro de avances y coordinacion en obra.', 3),
  ('00000000-0000-0000-0000-000000000104', 'Remodelacion y ampliacion', 'Intervenimos viviendas, locales y espacios existentes con soluciones funcionales y buen criterio constructivo.', 4)
on conflict (id) do update set
  title = excluded.title,
  text = excluded.text,
  display_order = excluded.display_order;

insert into public.team_members (id, name, role, bio, image, display_order)
values
  ('00000000-0000-0000-0000-000000000201', 'Ing. Marcelo Mondoza', 'Director general', 'Lidera la estrategia de obra, relacion comercial y la vision integral de la empresa.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=90', 1),
  ('00000000-0000-0000-0000-000000000202', 'Arq. Daniela Rojas', 'Gerencia de proyectos', 'Coordina arquitectura, avances visuales, documentacion y experiencia de presentacion para clientes.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=90', 2),
  ('00000000-0000-0000-0000-000000000203', 'Ing. Pablo Quiroga', 'Jefe de obra', 'Controla cronogramas, calidad, seguridad y seguimiento de hitos constructivos en campo.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=90', 3)
on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  image = excluded.image,
  display_order = excluded.display_order;

insert into public.works (
  id, slug, title, category, location, year, area, status, client_name, owner_name, summary, description, hero_image, gallery, plan_files, brochure_file, metrics, map_embed_url
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    'casa-piedra-norte',
    'Casa Piedra Norte',
    'Obra residencial',
    'Tiquipaya, Cochabamba',
    '2025',
    '620 m2',
    'en_progreso',
    'Familia Camacho',
    'Mondoza Construcciones',
    'Residencia contemporanea con piedra, patios y una lectura espacial sobria.',
    'Una obra privada con fuerte protagonismo de materiales nobles, control de detalles y actualizaciones pensadas para mostrar confianza al cliente final.',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/casa-piedra-norte-planta-baja.pdf","https://example.com/planos/casa-piedra-norte-cortes.pdf"]'::jsonb,
    'https://example.com/brochures/casa-piedra-norte-ficha.pdf',
    '[{"label":"Cliente","value":"Familia Camacho"},{"label":"Estado","value":"En progreso"},{"label":"Entrega","value":"Segundo semestre 2026"},{"label":"Supervision","value":"Semanal"}]'::jsonb,
    'https://www.google.com/maps?q=Cochabamba%20Bolivia&output=embed'
  ),
  (
    '00000000-0000-0000-0000-000000000302',
    'centro-empresarial-nova',
    'Centro Empresarial Nova',
    'Obra comercial',
    'Equipetrol, Santa Cruz',
    '2024',
    '6850 m2',
    'finalizado',
    'Nova Group',
    'Mondoza Construcciones',
    'Volumen corporativo de lectura nitida, acceso sobrio y presencia institucional.',
    'Proyecto comercial pensado para mostrar solidez de marca, experiencia de acceso y ejecucion integral con documentacion organizada.',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/nova-masterplan.pdf","https://example.com/planos/nova-fachada.pdf"]'::jsonb,
    'https://example.com/brochures/centro-empresarial-nova-ficha.pdf',
    '[{"label":"Cliente","value":"Nova Group"},{"label":"Estado","value":"Finalizado"},{"label":"Entrega","value":"2024"},{"label":"Programa","value":"Oficinas + retail"}]'::jsonb,
    'https://www.google.com/maps?q=Santa%20Cruz%20Bolivia&output=embed'
  ),
  (
    '00000000-0000-0000-0000-000000000303',
    'villa-jardin-sur',
    'Villa Jardin Sur',
    'Obra residencial',
    'Achumani, La Paz',
    '2026',
    '540 m2',
    'planificacion',
    'Familia Ortega',
    'Mondoza Construcciones',
    'Casa de volumetria limpia con patios y programa familiar de alto nivel.',
    'Proyecto de vivienda unifamiliar orientado a visualizacion comercial, planos y seguimiento de ejecucion desde el primer hito.',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1600566752227-8f3b9653d4a3?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/villa-jardin-planta-arquitectonica.pdf"]'::jsonb,
    'https://example.com/brochures/villa-jardin-sur-ficha.pdf',
    '[{"label":"Cliente","value":"Familia Ortega"},{"label":"Estado","value":"Planificacion"},{"label":"Entrega","value":"2027"},{"label":"Supervision","value":"Quincenal"}]'::jsonb,
    'https://www.google.com/maps?q=La%20Paz%20Bolivia&output=embed'
  )
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  category = excluded.category,
  location = excluded.location,
  year = excluded.year,
  area = excluded.area,
  status = excluded.status,
  client_name = excluded.client_name,
  owner_name = excluded.owner_name,
  summary = excluded.summary,
  description = excluded.description,
  hero_image = excluded.hero_image,
  gallery = excluded.gallery,
  plan_files = excluded.plan_files,
  brochure_file = excluded.brochure_file,
  metrics = excluded.metrics,
  map_embed_url = excluded.map_embed_url;

delete from public.work_updates where work_id in (
  '00000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000302',
  '00000000-0000-0000-0000-000000000303'
);

insert into public.work_updates (id, work_id, title, date, summary, performed_by, photos, is_deleted)
values
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000301', 'Cimentacion terminada', '2026-02-18', 'Se completo la base estructural y se cerro el primer control de calidad.', 'Ing. Pablo Quiroga', '["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1600&q=90"]'::jsonb, false),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000301', 'Muros y estructura principal', '2026-03-25', 'La volumetria principal ya puede revisarse visualmente en recorridos y fotografias.', 'Arq. Daniela Rojas', '["https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=90","https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=1600&q=90"]'::jsonb, false),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000302', 'Entrega final', '2024-11-09', 'Se entregaron planos finales, fotografias y documentacion de cierre del proyecto.', 'Ing. Marcelo Mondoza', '["https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=90"]'::jsonb, false),
  ('00000000-0000-0000-0000-000000000404', '00000000-0000-0000-0000-000000000303', 'Aprobacion de anteproyecto', '2026-05-14', 'Se cerro la fase de revision arquitectonica y se habilito documentacion tecnica.', 'Arq. Daniela Rojas', '["https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=90"]'::jsonb, false);

insert into public.buildings (
  id, slug, title, category, location, year, area, status, client_name, owner_name, summary, description, hero_image, gallery, plan_files, brochure_file, metrics, amenities, map_embed_url
)
values
  (
    '00000000-0000-0000-0000-000000000501',
    'torre-mirador',
    'Torre Mirador',
    'Edificio residencial',
    'Zona Norte, Cochabamba',
    '2026',
    '4200 m2',
    'en_progreso',
    'Mirador Desarrollos',
    'Mondoza Construcciones',
    'Edificio pensado para comunicar presencia, orden y disponibilidad clara de unidades.',
    'La experiencia del edificio combina comercializacion de departamentos, avances de obra, datos tecnicos y recorrido visual por unidad disponible.',
    'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/torre-mirador-planta-tipica.pdf"]'::jsonb,
    'https://example.com/brochures/torre-mirador-ficha.pdf',
    '[{"label":"Unidades","value":"28 departamentos"},{"label":"Estado","value":"En progreso"},{"label":"Entrega","value":"2026"},{"label":"Modalidad","value":"Venta directa"}]'::jsonb,
    '["Lobby doble altura","Terraza social","Parqueos","Seguridad 24/7"]'::jsonb,
    'https://www.google.com/maps?q=Cochabamba%20Bolivia&output=embed'
  ),
  (
    '00000000-0000-0000-0000-000000000502',
    'altos-del-bosque',
    'Altos del Bosque',
    'Edificio residencial',
    'Irpavi, La Paz',
    '2027',
    '5100 m2',
    'planificacion',
    'Bosque Habitat',
    'Mondoza Construcciones',
    'Proyecto residencial con vistas panoramicas, buenas tipologias y lectura clara de cada departamento.',
    'Pensado para una etapa comercial temprana, con informacion ordenada, planos y disponibilidad visible para cada unidad.',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/altos-bosque-tipologia-a.pdf","https://example.com/planos/altos-bosque-tipologia-b.pdf"]'::jsonb,
    'https://example.com/brochures/altos-del-bosque-ficha.pdf',
    '[{"label":"Unidades","value":"34 departamentos"},{"label":"Estado","value":"Planificacion"},{"label":"Entrega","value":"2027"},{"label":"Modalidad","value":"Preventa"}]'::jsonb,
    '["Cowork","Rooftop","Piscina temperada","Gym"]'::jsonb,
    'https://www.google.com/maps?q=La%20Paz%20Bolivia&output=embed'
  ),
  (
    '00000000-0000-0000-0000-000000000503',
    'nova-suites',
    'Nova Suites',
    'Edificio mixto',
    'Equipetrol, Santa Cruz',
    '2025',
    '6800 m2',
    'finalizado',
    'Nova Habitat',
    'Mondoza Construcciones',
    'Torre mixta con unidades residenciales y suites ejecutivas.',
    'Proyecto finalizado con enfoque comercial, presentacion clara y consulta directa por cada unidad disponible.',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90',
    '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=90","https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=2200&q=90"]'::jsonb,
    '["https://example.com/planos/nova-suites-tipo-estudio.pdf"]'::jsonb,
    'https://example.com/brochures/nova-suites-ficha.pdf',
    '[{"label":"Unidades","value":"40 suites"},{"label":"Estado","value":"Finalizado"},{"label":"Entrega","value":"2025"},{"label":"Modalidad","value":"Venta directa"}]'::jsonb,
    '["Lobby","Business lounge","Gym","Seguridad 24/7"]'::jsonb,
    'https://www.google.com/maps?q=Santa%20Cruz%20Bolivia&output=embed'
  )
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  category = excluded.category,
  location = excluded.location,
  year = excluded.year,
  area = excluded.area,
  status = excluded.status,
  client_name = excluded.client_name,
  owner_name = excluded.owner_name,
  summary = excluded.summary,
  description = excluded.description,
  hero_image = excluded.hero_image,
  gallery = excluded.gallery,
  plan_files = excluded.plan_files,
  brochure_file = excluded.brochure_file,
  metrics = excluded.metrics,
  amenities = excluded.amenities,
  map_embed_url = excluded.map_embed_url;

delete from public.building_units where building_id in (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000503'
);

insert into public.building_units (id, building_id, title, bedrooms, bathrooms, area, floor_label, price, is_available)
values
  ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', 'Departamento 2H', 2, 2, '84 m2', 'Pisos 4 y 5', 'USD 89.000', true),
  ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', 'Departamento 3H', 3, 3, '112 m2', 'Piso 8', 'USD 118.000', true),
  ('00000000-0000-0000-0000-000000000603', '00000000-0000-0000-0000-000000000501', 'Penthouse', 4, 4, '180 m2', 'Piso 12', 'Reservado', false),
  ('00000000-0000-0000-0000-000000000604', '00000000-0000-0000-0000-000000000502', 'Tipologia A', 2, 2, '92 m2', 'Pisos 3 al 7', 'USD 101.000', true),
  ('00000000-0000-0000-0000-000000000605', '00000000-0000-0000-0000-000000000502', 'Tipologia B', 3, 3, '124 m2', 'Pisos 8 al 11', 'USD 132.000', true),
  ('00000000-0000-0000-0000-000000000606', '00000000-0000-0000-0000-000000000503', 'Suite Ejecutiva', 1, 1, '56 m2', 'Pisos 2 al 9', 'USD 74.000', true),
  ('00000000-0000-0000-0000-000000000607', '00000000-0000-0000-0000-000000000503', 'Suite Premium', 2, 2, '78 m2', 'Pisos 10 al 14', 'USD 96.000', false);
