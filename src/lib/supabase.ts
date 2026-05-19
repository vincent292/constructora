import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseProjectUrl = supabaseUrl ?? "";
export const supabasePublicAnonKey = supabaseAnonKey ?? "";

function looksLikeJwt(value: string) {
  return value.split(".").length === 3;
}

function assertSupabasePublicConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase no esta configurado.");
  }

  if (!looksLikeJwt(supabaseAnonKey)) {
    throw new Error(
      "La VITE_SUPABASE_ANON_KEY local no es valida. Ejecuta `npx supabase status` y copia la ANON KEY real."
    );
  }
}

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseProjectUrl, supabasePublicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

type QueryValue = string | number | boolean;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  if (!supabaseUrl) {
    throw new Error("Supabase no configurado.");
  }

  const url = new URL(`/rest/v1/${path}`, supabaseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Error en Supabase");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function supabaseSelect<T>(
  path: string,
  query?: Record<string, QueryValue>
): Promise<T> {
  assertSupabasePublicConfig();

  const response = await fetch(buildUrl(path, query), {
    headers: {
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${supabaseAnonKey!}`,
    },
  });

  return parseResponse<T>(response);
}

export async function supabaseInsert<TBody extends object>(
  path: string,
  body: TBody,
  options?: {
    prefer?: "return=representation" | "return=minimal";
  }
) {
  assertSupabasePublicConfig();

  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: options?.prefer ?? "return=representation",
      apikey: supabaseAnonKey!,
      Authorization: `Bearer ${supabaseAnonKey!}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}
