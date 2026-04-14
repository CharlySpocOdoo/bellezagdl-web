
import { getOrder, acceptPartialOrder, requestReturn, cancelOrder } from '../../api/orders'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopBar } from '../../components/TopBar'
import { theme } from '../../theme'
import type { Order, OrderStatus } from '../../types'

const statusLabel: Record<OrderStatus, string> = {
    pending: 'Pendiente',
    partially_available: 'Revisar disponibilidad',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    in_delivery: 'En camino',
    delivery_failed: 'Entrega fallida',
    delivered_to_vendor: 'Entregado al vendedor',
    delivered_to_client: 'Entregado',
    return_requested: 'Devolución solicitada',
    cancelled: 'Cancelado',
}

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
    pending: { bg: theme.colors.neutral[50], text: theme.colors.neutral[800] },
    partially_available: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
    confirmed: { bg: theme.colors.secondary[50], text: theme.colors.secondary[800] },
    preparing: { bg: theme.colors.secondary[50], text: theme.colors.secondary[800] },
    in_delivery: { bg: theme.colors.primary[50], text: theme.colors.primary[800] },
    delivery_failed: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
    delivered_to_vendor: { bg: theme.colors.primary[50], text: theme.colors.primary[800] },
    delivered_to_client: { bg: '#EAF3DE', text: '#27500A' },
    return_requested: { bg: theme.colors.accent[50], text: theme.colors.accent[800] },
    cancelled: { bg: theme.colors.neutral[50], text: theme.colors.neutral[600] },
}

export function OrderDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isActing, setIsActing] = useState(false)
    const [actionError, setActionError] = useState('')
    const [actionSuccess, setActionSuccess] = useState('')



    useEffect(() => {
        if (!id) return
        const load = async () => {
            try {
                const data = await getOrder(id)
                setOrder(data)
            } catch {
                navigate('/orders')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id])



    const handlePartialAccept = async (accept: boolean) => {
        if (!order) return
        setIsActing(true)
        setActionError('')
        try {
            const updated = await acceptPartialOrder(order.id, accept)
            setOrder(updated)
            setActionSuccess(accept
                ? 'Pedido aceptado con los productos disponibles.'
                : 'Pedido cancelado correctamente.'
            )
        } catch (err: any) {
            if (err.response?.data?.detail) {
                setActionError(err.response.data.detail)
            } else {
                setActionError('No se pudo procesar la acción. Intenta de nuevo.')
            }
        } finally {
            setIsActing(false)
        }
    }

    const handleRequestReturn = async () => {
        if (!order) return
        setIsActing(true)
        setActionError('')
        try {
            const updated = await requestReturn(order.id)
            setOrder(updated)
            setActionSuccess('Devolución solicitada correctamente.')
        } catch (err: any) {
            if (err.response?.data?.detail) {
                setActionError(err.response.data.detail)
            } else {
                setActionError('No se pudo solicitar la devolución. Intenta de nuevo.')
            }
        } finally {
            setIsActing(false)
        }
    }

    const handleCancel = async () => {
        if (!order) return
        setIsActing(true)
        setActionError('')
        try {
            const updated = await cancelOrder(order.id)
            setOrder(updated)
            setActionSuccess('Pedido cancelado correctamente.')

        } catch (err: any) {
            if (err.response?.data?.detail) {
                setActionError(err.response.data.detail)
            } else {
                setActionError('No se pudo cancelar el pedido. Intenta de nuevo.')
            }
        } finally {
            setIsActing(false)
        }
    }


    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
                <TopBar />
                <div style={{ textAlign: 'center', padding: '48px', color: theme.semantic.textMuted }}>
                    Cargando pedido...
                </div>
            </div>
        )
    }

    if (!order) return null

    const colors = statusColors[order.status]

    return (
        <div style={{ minHeight: '100vh', background: theme.semantic.bgPage }}>
            <TopBar />
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Volver */}
                <button
                    onClick={() => navigate('/orders')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: theme.semantic.textMuted,
                        fontSize: '14px',
                        padding: '0 0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                >
                    ← Volver a mis pedidos
                </button>

                {/* Header del pedido */}
                <div style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: '1px solid ' + theme.semantic.border,
                    padding: '20px 24px',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        marginBottom: '16px',
                    }}>
                        <div>
                            <h1 style={{ fontSize: '20px', fontWeight: 500, color: theme.semantic.textPrimary, margin: '0 0 4px' }}>
                                {order.order_number}
                            </h1>
                            <p style={{ fontSize: '13px', color: theme.semantic.textMuted, margin: 0 }}>
                                {new Date(order.created_at).toLocaleDateString('es-MX', {
                                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '13px',
                            fontWeight: 500,
                            background: colors.bg,
                            color: colors.text,
                        }}>
                            {statusLabel[order.status]}
                        </span>
                    </div>

                    {/* Totales */}
                    <div style={{
                        borderTop: '1px solid ' + theme.semantic.border,
                        paddingTop: '16px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px',
                    }}>
                        {[
                            {
                                label: 'Subtotal',
                                value: '$' + (order.status === 'partially_available'
                                    ? order.items?.filter(i => !i.cancelled_in_partial).reduce((sum, i) => sum + Number(i.subtotal), 0).toFixed(2)
                                    : Number(order.subtotal).toFixed(2))
                            },
                            {
                                label: 'Envío',
                                value: Number(order.shipping_cost) === 0 ? 'Gratis' : '$' + Number(order.shipping_cost).toFixed(2)
                            },
                            {
                                label: 'Total',
                                value: '$' + (order.status === 'partially_available'
                                    ? (order.items?.filter(i => !i.cancelled_in_partial).reduce((sum, i) => sum + Number(i.subtotal), 0) + Number(order.shipping_cost)).toFixed(2)
                                    : Number(order.total).toFixed(2))
                            },
                        ].map((item) => (
                            <div key={item.label} style={{ background: theme.colors.neutral[50], borderRadius: '8px', padding: '12px 16px' }}>
                                <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: '0 0 4px' }}>{item.label}</p>
                                <p style={{ fontSize: '16px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mensajes de acción */}
                {actionSuccess && (
                    <div style={{
                        background: '#EAF3DE',
                        border: '1px solid #C0DD97',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        color: '#27500A',
                    }}>
                        {actionSuccess}
                    </div>
                )}
                {actionError && (
                    <div style={{
                        background: theme.semantic.statusAlert,
                        border: '1px solid ' + theme.colors.accent[100],
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        fontSize: '14px',
                        color: theme.semantic.statusAlertText,
                    }}>
                        {actionError}
                    </div>
                )}

                {/* Acción — pedido parcial */}
                {order.status === 'partially_available' && (
                    <div style={{
                        background: theme.colors.accent[50],
                        border: '1px solid ' + theme.colors.accent[100],
                        borderRadius: '12px',
                        padding: '20px 24px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '15px', fontWeight: 500, color: theme.colors.accent[800], margin: '0 0 8px' }}>
                            Algunos productos no están disponibles
                        </p>
                        <p style={{ fontSize: '13px', color: theme.colors.accent[600], margin: '0 0 16px' }}>
                            El administrador marcó que algunos productos de tu pedido no están disponibles.
                            Puedes aceptar el pedido con los productos disponibles o cancelarlo completamente.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handlePartialAccept(true)}
                                disabled={isActing}
                                style={{
                                    padding: '10px 20px',
                                    background: theme.semantic.actionPrimary,
                                    color: theme.semantic.textOnPrimary,
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isActing ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    opacity: isActing ? 0.7 : 1,
                                }}
                            >
                                {isActing ? 'Procesando...' : 'Aceptar productos disponibles'}
                            </button>
                            <button
                                onClick={() => handlePartialAccept(false)}
                                disabled={isActing}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    color: theme.colors.accent[800],
                                    border: '1px solid ' + theme.colors.accent[200],
                                    borderRadius: '8px',
                                    cursor: isActing ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    opacity: isActing ? 0.7 : 1,
                                }}
                            >
                                Cancelar pedido
                            </button>
                        </div>
                    </div>
                )}

                {/* Acción — solicitar devolución */}
                {(order.status === 'delivered_to_client' || order.status === 'delivered_to_vendor') && (
                    <div style={{
                        background: theme.colors.neutral[50],
                        border: '1px solid ' + theme.semantic.border,
                        borderRadius: '12px',
                        padding: '16px 24px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}>
                        <p style={{ fontSize: '14px', color: theme.semantic.textSecondary, margin: 0 }}>
                            ¿Necesitas devolver este pedido?
                        </p>
                        <button
                            onClick={handleRequestReturn}
                            disabled={isActing}
                            style={{
                                padding: '8px 20px',
                                background: 'transparent',
                                color: theme.semantic.actionPrimary,
                                border: '1px solid ' + theme.semantic.actionPrimary,
                                borderRadius: '8px',
                                cursor: isActing ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                opacity: isActing ? 0.7 : 1,
                            }}
                        >
                            {isActing ? 'Procesando...' : 'Solicitar devolución'}
                        </button>
                    </div>
                )}



                {(order.status === 'pending' || order.status === 'confirmed') && (
                    <div style={{
                        background: theme.colors.neutral[50],
                        border: '1px solid ' + theme.semantic.border,
                        borderRadius: '12px',
                        padding: '16px 24px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                    }}>
                        <p style={{ fontSize: '14px', color: theme.semantic.textSecondary, margin: 0 }}>
                            ¿Deseas cancelar este pedido?
                        </p>
                        <button
                            onClick={handleCancel}
                            disabled={isActing}
                            style={{
                                padding: '8px 20px',
                                background: 'transparent',
                                color: theme.colors.accent[800],
                                border: '1px solid ' + theme.colors.accent[200],
                                borderRadius: '8px',
                                cursor: isActing ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                opacity: isActing ? 0.7 : 1,
                            }}
                        >
                            {isActing ? 'Procesando...' : 'Cancelar pedido'}
                        </button>
                    </div>
                )}

                {/* Items del pedido */}
                <div style={{
                    background: theme.semantic.bgCard,
                    borderRadius: '12px',
                    border: '1px solid ' + theme.semantic.border,
                    overflow: 'hidden',
                    marginBottom: '16px',
                }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid ' + theme.semantic.border }}>
                        <h2 style={{ fontSize: '15px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
                            Productos
                        </h2>
                    </div>



                    {order.items?.map((item, index) => (
                        <div
                            key={item.id}
                            style={{
                                padding: '14px 24px',
                                borderBottom: index < order.items.length - 1 ? '1px solid ' + theme.semantic.border : 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '8px',
                                opacity: item.cancelled_in_partial ? 0.5 : 1,
                                background: item.cancelled_in_partial ? theme.colors.neutral[50] : 'transparent',
                            }}
                        >
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: theme.semantic.textPrimary, margin: 0 }}>
                                        {item.product_name_snapshot || 'Producto — variante ' + (index + 1)}
                                        {item.variant_name_snapshot && ' — ' + item.variant_name_snapshot}
                                    </p>
                                    {item.cancelled_in_partial && (
                                        <span style={{
                                            fontSize: '11px',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            background: theme.colors.accent[50],
                                            color: theme.colors.accent[800],
                                            fontWeight: 500,
                                        }}>
                                            No disponible
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '12px', color: theme.semantic.textMuted, margin: 0 }}>
                                    Cantidad: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                                </p>
                            </div>
                            <p style={{
                                fontSize: '15px',
                                fontWeight: 500,
                                color: item.cancelled_in_partial ? theme.semantic.textMuted : theme.semantic.textPrimary,
                                margin: 0,
                                textDecoration: item.cancelled_in_partial ? 'line-through' : 'none',
                            }}>
                                ${Number(item.subtotal).toFixed(2)}
                            </p>
                        </div>
                    ))}



                </div>

            </div>
        </div>
    )
}