// Imágenes de producto muy angostas (ej. plumas delineadoras) quedan muy
// pequeñas con object-fit: contain, dejando espacio vacío a los lados.
// Esta tabla de umbrales agranda la imagen (vía transform: scale) cuando
// su proporción ancho/alto es muy angosta — el contenedor ya tiene
// overflow: hidden, así que el excedente se recorta limpiamente.
export function getThinImageScale(ratio: number | null): number {
  if (ratio === null) return 1
  if (ratio >= 0.75) return 1
  if (ratio >= 0.5) return 1.15
  if (ratio >= 0.35) return 1.35
  return 1.6
}
