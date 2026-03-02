'use client'

import { useState } from 'react'
import { Calendar, Search } from 'lucide-react'
import { useReservations, useAssets } from '@/hooks/useSupabaseData'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'rgba(34,197,94,0.15)', text: '#22C55E' },
    pending: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', text: '#EF4444' },
}

const STATUS_LABELS: Record<string, string> = {
    all: 'todas',
    confirmed: 'confirmada',
    pending: 'pendiente',
    cancelled: 'cancelada',
}

export default function AdminReservationsPage() {
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const { reservations, loading: resLoading } = useReservations()
    const { assets, loading: assLoading } = useAssets()

    const loading = resLoading || assLoading

    const getAssetName = (assetId: string) => assets.find(a => a.id === assetId)?.name || 'Desconocido'

    const filteredReservations = reservations.filter(r => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter
        const matchesSearch = r.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            getAssetName(r.asset_id).toLowerCase().includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.5)' }}>Cargando reservas...</div>
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>Reservas</h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Gestiona todas las reservas ({reservations.length} en total)</p>
                </div>
                <button className="btn btn-primary" style={{ fontSize: 13 }}><Calendar size={16} /> Nueva Reserva</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar por huésped o propiedad..." style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(19,31,51,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{
                            padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', textTransform: 'capitalize',
                            background: statusFilter === s ? 'rgba(10,186,181,0.15)' : 'rgba(255,255,255,0.04)',
                            color: statusFilter === s ? '#0ABAB5' : 'rgba(255,255,255,0.5)',
                        }}>{STATUS_LABELS[s]}</button>
                    ))}
                </div>
            </div>

            <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 100px 100px 100px 80px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, gap: 12 }}>
                    <span>Huésped</span><span>Propiedad</span><span>Llegada</span><span>Salida</span><span>Total</span><span style={{ textAlign: 'center' }}>Estado</span>
                </div>

                {filteredReservations.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No se encontraron reservas</div>
                )}

                {filteredReservations.map((res, idx) => {
                    const statusStyle = STATUS_COLORS[res.status] || STATUS_COLORS.pending
                    return (
                        <div key={res.id} style={{
                            display: 'grid', gridTemplateColumns: '1fr 1.5fr 100px 100px 100px 80px', padding: '16px 20px',
                            borderBottom: idx < filteredReservations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            alignItems: 'center', gap: 12, transition: 'background 0.2s', cursor: 'pointer',
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{res.guest_name || 'Huésped'}</span>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{getAssetName(res.asset_id)}</span>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{res.check_in.slice(5)}</span>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{res.check_out.slice(5)}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#0ABAB5' }}>${res.total_price.toLocaleString()}</span>
                            <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.text, fontSize: 10, justifySelf: 'center' }}>{STATUS_LABELS[res.status] || res.status}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
