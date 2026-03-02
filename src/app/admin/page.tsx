'use client'

import { useState, useMemo } from 'react'
import { Building2, Ship, Users, DollarSign, TrendingUp, ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react'
import { useAssets, useReservations } from '@/hooks/useSupabaseData'
import { format, getDaysInMonth, addMonths, subMonths, isSameMonth, parseISO } from 'date-fns'

const STATUS_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
    confirmed: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E', bar: '#22C55E' },
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B', bar: '#F59E0B' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444', bar: '#EF4444' },
}

export default function AdminDashboard() {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedReservation, setSelectedReservation] = useState<string | null>(null)
    const { assets, loading: assetsLoading } = useAssets()
    const { reservations, loading: reservationsLoading } = useReservations()

    const loading = assetsLoading || reservationsLoading
    const daysInMonth = getDaysInMonth(currentMonth)
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const apartments = assets.filter(a => a.type === 'apartment')
    const yachts = assets.filter(a => a.type === 'yacht')

    const today = format(new Date(), 'yyyy-MM-dd')

    const occupiedToday = useMemo(() => {
        return reservations.filter(r =>
            r.status !== 'cancelled' && r.check_in <= today && r.check_out > today
        ).length
    }, [reservations, today])

    const pendingCount = reservations.filter(r => r.status === 'pending').length
    const totalRevenue = reservations
        .filter(r => r.status === 'confirmed')
        .reduce((sum, r) => sum + r.total_price, 0)

    const getReservationsForAsset = (assetId: string) => {
        return reservations.filter(r =>
            r.asset_id === assetId && r.status !== 'cancelled'
        )
    }

    const getBarStyle = (checkIn: string, checkOut: string) => {
        const ciDate = parseISO(checkIn)
        const coDate = parseISO(checkOut)

        // Only show bars for the current month
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

        const startDay = ciDate < monthStart ? 1 : ciDate.getDate()
        const endDay = coDate > monthEnd ? daysInMonth : coDate.getDate()

        if (startDay > daysInMonth || endDay < 1) return null

        const totalDays = daysInMonth
        const left = ((startDay - 1) / totalDays) * 100
        const width = ((endDay - startDay) / totalDays) * 100
        return { left: `${left}%`, width: `${Math.max(width, 2)}%` }
    }

    const isReservationInMonth = (checkIn: string, checkOut: string) => {
        const monthStart = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), 'yyyy-MM-dd')
        const monthEnd = format(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0), 'yyyy-MM-dd')
        return checkIn <= monthEnd && checkOut >= monthStart
    }

    const selectedRes = selectedReservation
        ? reservations.find(r => r.id === selectedReservation)
        : null

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.5)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Cargando panel...</div>
                    <div style={{ fontSize: 14 }}>Obteniendo propiedades y reservas</div>
                </div>
            </div>
        )
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>Disponibilidad y Ocupación</h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Monitorea todas las reservas de propiedades y yates en tiempo real</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-outline" style={{ fontSize: 13 }}><Plus size={16} /> Agregar Propiedad</button>
                    <button className="btn btn-primary" style={{ fontSize: 13 }}><Calendar size={16} /> Nueva Reserva</button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
                {[
                    { label: 'Total Propiedades', value: assets.length, icon: Building2, color: '#0ABAB5' },
                    { label: 'Ocupadas Hoy', value: occupiedToday, icon: Users, color: '#22C55E' },
                    { label: 'Reservas Pendientes', value: pendingCount, icon: Calendar, color: '#F59E0B' },
                    { label: 'Ingresos (Total)', value: `$${(totalRevenue / 1000).toFixed(1)}k`, icon: DollarSign, color: '#D4A853' },
                ].map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={i} style={{
                            background: 'rgba(19,31,51,0.8)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 'var(--radius-lg)', padding: '20px 24px', backdropFilter: 'blur(8px)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{stat.label}</span>
                                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={18} color={stat.color} />
                                </div>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: 'white', fontFamily: 'Inter, sans-serif' }}>{stat.value}</div>
                        </div>
                    )
                })}
            </div>

            {/* Month Nav */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
                padding: '12px 20px', background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'white', minWidth: 160, textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#22C55E' }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Confirmada</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: '#F59E0B' }} />
                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>Pendiente</span>
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div style={{
                background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden',
            }}>
                {/* Day Headers */}
                <div style={{ display: 'flex' }}>
                    <div style={{
                        width: 220, minWidth: 220, padding: '12px 20px', borderRight: '1px solid rgba(255,255,255,0.06)',
                        borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 12, fontWeight: 600,
                        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1,
                    }}>Propiedad</div>
                    <div style={{ flex: 1, display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        {days.map(day => {
                            const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                            const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6
                            const isTodayDay = format(dayDate, 'yyyy-MM-dd') === today
                            return (
                                <div key={day} style={{
                                    flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 11,
                                    fontWeight: isTodayDay ? 700 : 500,
                                    color: isTodayDay ? '#0ABAB5' : isWeekend ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)',
                                    background: isTodayDay ? 'rgba(10,186,181,0.1)' : 'transparent',
                                    borderRight: '1px solid rgba(255,255,255,0.03)',
                                }}>{day}</div>
                            )
                        })}
                    </div>
                </div>

                {/* Render asset groups */}
                {[
                    { items: apartments, label: 'Apartamentos', icon: Building2, color: '#0ABAB5' },
                    { items: yachts, label: 'Yates', icon: Ship, color: '#D4A853' },
                ].map(group => group.items.length > 0 && (
                    <div key={group.label}>
                        <div style={{
                            padding: '8px 20px', background: `${group.color}08`, borderBottom: '1px solid rgba(255,255,255,0.04)',
                            display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                            <group.icon size={14} color={group.color} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: group.color, textTransform: 'uppercase', letterSpacing: 1.5 }}>{group.label}</span>
                        </div>
                        {group.items.map(asset => (
                            <div key={asset.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <div style={{
                                    width: 220, minWidth: 220, padding: '14px 20px', borderRight: '1px solid rgba(255,255,255,0.06)',
                                    display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: 'var(--radius-md)',
                                        background: `linear-gradient(135deg, ${group.color}, ${group.color}88)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    }}>
                                        <group.icon size={14} color="white" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 500, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>{asset.name}</div>
                                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{asset.location}</div>
                                    </div>
                                </div>
                                <div style={{ flex: 1, position: 'relative', minHeight: 52 }}>
                                    <div style={{ display: 'flex', height: '100%', position: 'absolute', inset: 0 }}>
                                        {days.map(day => {
                                            const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                                            const isTodayDay = format(dayDate, 'yyyy-MM-dd') === today
                                            return <div key={day} style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.03)', background: isTodayDay ? 'rgba(10,186,181,0.06)' : 'transparent' }} />
                                        })}
                                    </div>
                                    {getReservationsForAsset(asset.id)
                                        .filter(res => isReservationInMonth(res.check_in, res.check_out))
                                        .map(res => {
                                            const barStyle = getBarStyle(res.check_in, res.check_out)
                                            if (!barStyle) return null
                                            const statusColor = STATUS_COLORS[res.status] || STATUS_COLORS.pending
                                            return (
                                                <div key={res.id} onClick={() => setSelectedReservation(res.id === selectedReservation ? null : res.id)} style={{
                                                    position: 'absolute', top: 10, bottom: 10, left: barStyle.left, width: barStyle.width,
                                                    background: statusColor.bar, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 10,
                                                    cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'white', zIndex: 5, transition: 'all 0.2s',
                                                    boxShadow: res.id === selectedReservation ? `0 0 0 2px white, 0 4px 12px ${statusColor.bar}50` : `0 2px 4px ${statusColor.bar}30`,
                                                    overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                                                }}>
                                                    {res.guest_name?.split(' ')[0] || 'Huésped'} {res.guest_name?.split(' ')[1]?.[0] ? `${res.guest_name.split(' ')[1][0]}.` : ''}
                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}

                {/* Empty state */}
                {assets.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                        No se encontraron propiedades. Agrega algunas propiedades para verlas aquí.
                    </div>
                )}
            </div>

            {/* Selected Reservation Detail */}
            {selectedRes && (
                <div style={{
                    marginTop: 20, padding: 24, background: 'rgba(19,31,51,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-lg)', animation: 'fadeIn 0.3s ease-out',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', fontFamily: 'Inter, sans-serif' }}>Detalles de la Reserva</h3>
                        <span className="badge" style={{ background: (STATUS_COLORS[selectedRes.status] || STATUS_COLORS.pending).bg, color: (STATUS_COLORS[selectedRes.status] || STATUS_COLORS.pending).text }}>{selectedRes.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Huésped</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{selectedRes.guest_name || 'Huésped'}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Llegada</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{selectedRes.check_in}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Salida</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{selectedRes.check_out}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Total</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#0ABAB5' }}>${selectedRes.total_price.toLocaleString()}</div>
                        </div>
                    </div>
                    {selectedRes.notes && (
                        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-md)', fontSize: 13, color: '#F59E0B' }}>
                            📝 {selectedRes.notes}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
