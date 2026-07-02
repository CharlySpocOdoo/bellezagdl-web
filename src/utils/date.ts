const toUTC = (dateStr: string) => {
  // Solo fechas con hora (contienen 'T') necesitan el sufijo Z
  // "2026-06-29" (solo fecha) es válido para new Date() sin modificar
  if (!dateStr.includes('T')) return dateStr
  return dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
}

export const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Regina',
    ...options,
  })
}

export const formatDateTime = (dateStr: string) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Regina',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatShortDate = (dateStr: string) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Regina',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatMonthRange = (dateStr: string, options: Intl.DateTimeFormatOptions) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Regina',
    ...options,
  })
}