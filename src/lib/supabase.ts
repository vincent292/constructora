const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

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

  return (await response.json()) as T;
}

export async function supabaseSelect<T>(
  path: string,
  query?: Record<string, QueryValue>
): Promise<T> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase no configurado.");
  }

  const response = await fetch(buildUrl(path, query), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  return parseResponse<T>(response);
}

export async function supabaseInsert<TBody extends object>(
  path: string,
  body: TBody
) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase no configurado.");
  }

  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=representation",
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });

  return parseResponse(response);
}
