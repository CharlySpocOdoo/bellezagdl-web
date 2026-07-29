// Quita acentos/diacríticos de un string (NFD + strip de marcas
// combinantes), sin tocar mayúsculas/minúsculas. Usado para construir
// URLs de S3 que deben coincidir exactamente con nombres de carpeta/archivo
// ya subidos (que no llevan acentos, sin importar cómo esté escrito el
// nombre en la base de datos).
export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}
