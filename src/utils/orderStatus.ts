import type { OrderStatus } from '../types'

export const statusLabel: Record<OrderStatus, string> = {
  pending:              'Pedido creado',
  partially_available:  'Revisar disponibilidad',
  confirmed:            'Preparando pedido',
  in_delivery:          'Pedido enviado',
  delivery_failed:      'Entrega fallida',
  delivered_to_client:  'Pedido entregado',
  cancelled:            'Cancelado',
}

export function getStatusLabel(status: OrderStatus, _saleType?: string): string {
  return statusLabel[status]
}

export const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending:              { bg: '#E6F1FB', text: '#185FA5' },
  partially_available:  { bg: '#FAEEDA', text: '#854F0B' },
  confirmed:            { bg: '#E6F1FB', text: '#185FA5' },
  in_delivery:          { bg: '#F3EDFB', text: '#6B3FA0' },
  delivery_failed:      { bg: '#FCEBEB', text: '#A32D2D' },
  delivered_to_client:  { bg: '#EAF3DE', text: '#3B6D11' },
  cancelled:            { bg: '#F1EFE8', text: '#5F5E5A' },
}