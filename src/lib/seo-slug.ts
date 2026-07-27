export function slugifyTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeLegacyTermSlug(value: string): string {
  try {
    return decodeURIComponent(value).replace(/-/g, " ").trim();
  } catch {
    return value.replace(/-/g, " ").trim();
  }
}
