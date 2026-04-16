const toUTC = (dateStr: string) => {
  return dateStr.endsWith('Z') ? dateStr : dateStr + 'Z'
}

export const formatDate = (dateStr: string, options?: Intl.DateTimeFormatOptions) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    ...options,
  })
}

export const formatDateTime = (dateStr: string) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatShortDate = (dateStr: string) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatMonthRange = (dateStr: string, options: Intl.DateTimeFormatOptions) => {
  return new Date(toUTC(dateStr)).toLocaleDateString('es-MX', {
    timeZone: 'America/Mazatlan',
    ...options,
  })
}