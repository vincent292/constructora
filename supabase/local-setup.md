# Supabase local para el CMS

## 1. Instalar prerequisitos

- Docker Desktop
- Node.js 20 o superior
- Supabase CLI via `npx`

## 2. Inicializar y levantar el stack local

Si todavia no tienes configuracion local de Supabase en este repo, ejecuta:

```bash
npx supabase init
```

Luego levanta los servicios:

```bash
npx supabase start
```

Para ver las credenciales locales:

```bash
npx supabase status -o env
```

## 3. Crear `.env.local`

Usa la salida del comando anterior y crea un archivo `.env.local` en la raiz:

```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=tu_anon_key_local
```

## 4. Aplicar la base del proyecto

El proyecto ya incluye la migracion:

- `supabase/migrations/202605190001_init_cms.sql`

Aplica todo con:

```bash
npx supabase db reset
```

Esto crea:

- tablas de obras, edificios, unidades, equipo y leads
- soporte de `plan_files` para obras y edificios
- bucket publico `media`
- policies para lectura publica del sitio
- policies autenticadas para administrar el CMS

## 5. Crear usuario admin

Con el stack local encendido, entra a Studio:

- `http://127.0.0.1:54323`

Luego crea un usuario en `Authentication > Users`, o usa la pantalla de `/cms` para registrar uno local.

## 6. Entrar al CMS

Con la app levantada:

```bash
npm run dev
```

Abre:

- `http://localhost:5173/cms`

Desde ahi ya puedes:

- crear y editar obras
- crear y editar edificios
- subir portada, galeria y planos
- administrar el equipo
- revisar leads y cambiar su estado
