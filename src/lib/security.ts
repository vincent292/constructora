const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_REGEX = /^[0-9+()\-\s]{7,24}$/;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function collapseWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function assertEmail(value: string, label = "correo") {
  const normalized = normalizeEmail(value);

  if (!EMAIL_REGEX.test(normalized) || normalized.length > 255) {
    throw new Error(`El ${label} no es valido.`);
  }

  return normalized;
}

export function assertPassword(value: string) {
  const password = value.trim();

  if (password.length < 6) {
    throw new Error("La contrasena debe tener al menos 6 caracteres.");
  }

  if (password.length > 72) {
    throw new Error("La contrasena es demasiado larga.");
  }

  return password;
}

export function sanitizeText(
  value: string,
  label: string,
  options?: {
    min?: number;
    max?: number;
    preserveNewlines?: boolean;
  }
) {
  const min = options?.min ?? 0;
  const max = options?.max ?? 255;
  const normalized = options?.preserveNewlines
    ? value.replace(/\r\n/g, "\n").trim()
    : collapseWhitespace(value);

  if (normalized.length < min) {
    throw new Error(`${label} es demasiado corto.`);
  }

  if (normalized.length > max) {
    throw new Error(`${label} supera el limite permitido.`);
  }

  return normalized;
}

export function sanitizeOptionalText(
  value: string | null | undefined,
  label: string,
  max = 255
) {
  if (!value) {
    return "";
  }

  return sanitizeText(value, label, { max });
}

export function sanitizePhone(value: string) {
  const normalized = collapseWhitespace(value);

  if (!PHONE_REGEX.test(normalized)) {
    throw new Error("El telefono no es valido.");
  }

  return normalized;
}

export function sanitizeSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!SLUG_REGEX.test(slug) || slug.length < 3 || slug.length > 120) {
    throw new Error("El slug debe usar solo letras minusculas, numeros y guiones.");
  }

  return slug;
}

export function sanitizeHttpUrl(value: string, label: string, allowEmpty = true) {
  const normalized = value.trim();

  if (!normalized) {
    if (allowEmpty) {
      return "";
    }

    throw new Error(`${label} es obligatorio.`);
  }

  try {
    const url = new URL(normalized);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error();
    }
    return url.toString();
  } catch {
    throw new Error(`${label} no es valido.`);
  }
}

export function sanitizeUrlList(values: string[], label: string) {
  return values.map((value, index) =>
    sanitizeHttpUrl(value, `${label} ${index + 1}`, false)
  );
}

export function sanitizeStringList(values: string[], label: string, maxItemLength = 80) {
  return values
    .map((value) => sanitizeOptionalText(value, label, maxItemLength))
    .filter(Boolean);
}

