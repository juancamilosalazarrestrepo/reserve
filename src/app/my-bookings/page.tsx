'use client'

import Link from 'next/link'
import { Anchor, Calendar, MapPin, Ship, Building2, ExternalLink } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useMyReservations } from '@/hooks/useSupabaseData'

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    confirmed: { bg: 'var(--green-light)', text: 'var(--green)' },
    pending: { bg: 'var(--amber-light)', text: 'var(--amber)' },
    cancelled: { bg: 'var(--red-light)', text: 'var(--red)' },
}

const STATUS_TRANSLATIONS: Record<string, string> = {
    confirmed: 'Confirmada',
    pending: 'Pendiente',
    cancelled: 'Cancelada',
}

export default function MyBookingsPage() {
    const { user, profile } = useAuth()
    const { reservations, loading } = useMyReservations(user?.id)

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            <nav style={{ background: 'white', padding: '16px 40px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <Anchor size={24} color="#0ABAB5" />
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: 2 }}>RESERVE</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {profile && <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-700)' }}>{profile.full_name || 'Huésped'}</span>}
                        <Link href="/" style={{ fontSize: 14, color: 'var(--gray-500)', textDecoration: 'none' }}>← Volver a Inicio</Link>
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px' }}>
                <h1 style={{ fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>Mis Reservas</h1>
                <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 32 }}>Ver y administrar tu historial de reservas</p>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>Cargando tus reservas...</div>
                )}

                {!loading && reservations.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Calendar size={48} strokeWidth={1} style={{ color: 'var(--gray-300)', marginBottom: 16 }} />
                        <h3 style={{ fontSize: 18, color: 'var(--gray-600)', marginBottom: 8, fontFamily: 'Inter, sans-serif' }}>Aún no hay reservas</h3>
                        <p style={{ fontSize: 14, color: 'var(--gray-400)', marginBottom: 24 }}>¡Comienza a explorar nuestras lujosas propiedades!</p>
                        <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Explorar Propiedades</Link>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {reservations.map(res => {
                        const asset = res.asset
                        const statusStyle = STATUS_COLORS[res.status] || STATUS_COLORS.pending
                        return (
                            <div key={res.id} style={{
                                background: 'white', borderRadius: 'var(--radius-xl)', padding: 24,
                                border: '1px solid var(--gray-100)', display: 'flex', gap: 20, transition: 'all 0.2s',
                            }}>
                                <div style={{
                                    width: 100, height: 100, borderRadius: 'var(--radius-lg)',
                                    background: asset?.type === 'yacht' ? 'linear-gradient(135deg, #0ABAB5, #006D77)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    overflow: 'hidden', position: 'relative'
                                }}>
                                    {asset?.images && Array.isArray(asset.images) && asset.images.length > 0 ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={asset.images[0] as string} alt={asset.name || 'Propiedad'} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                    ) : (
                                        asset?.type === 'yacht' ? <Ship size={32} color="white" strokeWidth={1} /> : <Building2 size={32} color="white" strokeWidth={1} />
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', marginBottom: 4 }}>{asset?.name || 'Propiedad'}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--gray-400)' }}>
                                                <MapPin size={13} /> {asset?.location || 'San Andrés'}
                                            </div>
                                        </div>
                                        <span className="badge" style={{ background: statusStyle.bg, color: statusStyle.text, textTransform: 'capitalize' }}>{STATUS_TRANSLATIONS[res.status] || res.status}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--gray-500)' }}>
                                            <Calendar size={14} /> {res.check_in} → {res.check_out}
                                        </div>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--turquoise)' }}>${res.total_price.toLocaleString()}</span>
                                    </div>
                                </div>
                                {asset && (
                                    <Link href={`/assets/${asset.id}`} style={{ alignSelf: 'center', color: 'var(--turquoise)', display: 'flex' }}>
                                        <ExternalLink size={18} />
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
