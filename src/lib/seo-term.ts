import { SLANG_DATA, type SlangTerm } from "@/lib/slang-data";
import { slugifyTerm } from "@/lib/seo-slug";

export function getTermBySlug(slug: string): SlangTerm | undefined {
  const decoded = safelyDecode(slug).toLowerCase().trim();

  return SLANG_DATA.find((term) => {
    if (slugifyTerm(term.term) === decoded) return true;
    if (term.term.toLowerCase() === decoded) return true;

    return term.variations?.some((variation) => {
      const normalizedVariation = variation.toLowerCase().trim();
      return normalizedVariation === decoded || slugifyTerm(variation) === decoded;
    });
  });
}

function safelyDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
