// Muchos nombres de producto llegan del backend con la marca pegada al final
// (ej. "Rimel Volumen X CELAVI"). Como cada producto ya trae brand_name por
// separado, quitamos ese texto exacto del final en vez de adivinar un
// separador — funciona sin importar si viene con espacio, guión, coma, etc.
export function stripBrandFromName(name: string, brandName: string | null): string {
  const trimmedBrand = brandName?.trim()
  if (!trimmedBrand) return name

  const endsWithBrand = name.toLowerCase().endsWith(trimmedBrand.toLowerCase())
  if (!endsWithBrand) return name

  return name
    .slice(0, name.length - trimmedBrand.length)
    .replace(/[\s\-–—,|/]+$/, '')
    .trim()
}
