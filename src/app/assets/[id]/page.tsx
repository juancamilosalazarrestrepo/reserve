'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { Anchor, MapPin, Star, Users, BedDouble, Bath, Wifi, Waves, Car, UtensilsCrossed, Wind, Ship, Building2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAsset, useAssetReservations } from '@/hooks/useSupabaseData'
import { useAuth } from '@/context/AuthContext'
import { getDaysInMonth, format, addMonths, subMonths, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'

const AMENITY_ICONS: Record<string, React.ReactNode> = {
    'WiFi': <Wifi size={16} />,
    'Ocean View': <Waves size={16} />,
    'Sea View': <Waves size={16} />,
    'Parking': <Car size={16} />,
    'Full Kitchen': <UtensilsCrossed size={16} />,
    'Air Conditioning': <Wind size={16} />,
    'Private Balcony': <Waves size={16} />,
    'Pool Access': <Waves size={16} />,
}

const AMENITY_TRANSLATIONS: Record<string, string> = {
    'WiFi': 'WiFi',
    'Ocean View': 'Vista al Mar',
    'Sea View': 'Vista al Mar',
    'Parking': 'Estacionamiento',
    'Full Kitchen': 'Cocina Completa',
    'Air Conditioning': 'Aire Acondicionado',
    'Private Balcony': 'Balcón Privado',
    'Pool Access': 'Acceso a Piscina',
}

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { asset, loading } = useAsset(id)
    const { reservations: assetReservations } = useAssetReservations(id)
    const { user, profile } = useAuth()
    const [calendarMonth, setCalendarMonth] = useState(new Date())
    const [checkIn, setCheckIn] = useState('')
    const [checkOut, setCheckOut] = useState('')
    const [guests, setGuests] = useState(2)

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 16, color: 'var(--gray-500)' }}>Cargando propiedad...</div>
            </div>
        )
    }

    if (!asset) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h1>Propiedad no encontrada</h1>
            </div>
        )
    }

    const daysInMonth = getDaysInMonth(calendarMonth)
    const firstDayOfWeek = startOfMonth(calendarMonth).getDay()
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

    const isDateBooked = (day: number) => {
        const dateStr = `${format(calendarMonth, 'yyyy-MM')}-${String(day).padStart(2, '0')}`
        return assetReservations.some(r => dateStr >= r.check_in && dateStr < r.check_out)
    }

    const nights = checkIn && checkOut ?
        Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const subtotal = nights * asset.price_per_night
    const cleaningFee = 120
    const serviceFee = Math.round(subtotal * 0.04)
    const total = subtotal + cleaningFee + serviceFee

    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    ]

    const amenities = Array.isArray(asset.amenities) ? asset.amenities as string[] : []

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Top Nav */}
            <nav style={{ background: 'white', padding: '16px 40px', borderBottom: '1px solid var(--gray-100)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <Anchor size={24} color="#0ABAB5" />
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: 2 }}>RESERVE</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {user && profile ? (
                            <>
                                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-700)' }}>{profile.full_name || user.email?.split('@')[0]}</span>
                                <Link href="/my-bookings" style={{ fontSize: 13, color: 'var(--turquoise)', textDecoration: 'none', fontWeight: 500 }}>Mis Reservas</Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" style={{ fontSize: 14, color: 'var(--gray-600)', textDecoration: 'none', fontWeight: 500 }}>Iniciar Sesión</Link>
                                <Link href="/register" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: 'var(--radius-full)', fontSize: 13 }}>Reservar Ahora</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--gray-400)' }}>
                    <Link href="/" style={{ color: 'var(--turquoise)', textDecoration: 'none' }}>Inicio</Link>
                    <span>/</span>
                    <span style={{ textTransform: 'capitalize' }}>{asset.type === 'yacht' ? 'Yates' : 'Apartamentos'}</span>
                    <span>/</span>
                    <span style={{ color: 'var(--gray-600)' }}>{asset.name}</span>
                </div>
            </div>

            {/* Image Gallery */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: 480 }}>
                    {/* Main Image */}
                    <div style={{
                        background: asset.type === 'yacht' ? 'linear-gradient(135deg, #0ABAB5, #006D77)' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'white',
                    }}>
                        {Array.isArray(asset.images) && asset.images.length > 0 ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={asset.images[0] as string} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                        ) : (
                            <>
                                {asset.type === 'yacht' ? <Ship size={80} strokeWidth={0.8} /> : <Building2 size={80} strokeWidth={0.8} />}
                                <span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7, letterSpacing: 3, textTransform: 'uppercase' }}>{asset.name}</span>
                            </>
                        )}
                    </div>
                    {/* Secondary Images */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[0, 1, 2].map((i) => {
                            const imgUrl = Array.isArray(asset.images) && asset.images.length > i + 1 ? asset.images[i + 1] as string : null;
                            const placeholders = ['Habitación', 'Baño', 'Vista'];
                            return (
                                <div key={i} style={{ flex: 1, background: gradients[i % gradients.length], position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 500, opacity: 0.8, overflow: 'hidden' }}>
                                    {imgUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={imgUrl} alt={`${asset.name} - ${placeholders[i]}`} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                    ) : (
                                        placeholders[i]
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 80px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
                    <div>
                        <span className="badge badge-turquoise" style={{ marginBottom: 16, display: 'inline-flex' }}>
                            {asset.type === 'yacht' ? '⛵ Yate' : '🏢 Apartamento'}
                        </span>
                        <h1 style={{ fontSize: 36, color: 'var(--navy)', marginBottom: 8, lineHeight: 1.2 }}>{asset.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)' }}>
                                <MapPin size={16} /> <span style={{ fontSize: 14 }}>{asset.location}, San Andrés</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} size={14} color="#D4A853" fill={s <= 4 ? '#D4A853' : 'none'} />
                                ))}
                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginLeft: 4 }}>4.9</span>
                            </div>
                        </div>
                        <p style={{ fontSize: 15, color: 'var(--gray-600)', lineHeight: 1.8, marginBottom: 32 }}>{asset.description}</p>

                        <h3 style={{ fontSize: 20, color: 'var(--navy)', marginBottom: 20, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Comodidades</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 40 }}>
                            {amenities.map((amenity: string) => (
                                <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-100)' }}>
                                    <div style={{ color: 'var(--turquoise)' }}>{AMENITY_ICONS[amenity] || <Check size={16} />}</div>
                                    <span style={{ fontSize: 13, color: 'var(--gray-700)' }}>{AMENITY_TRANSLATIONS[amenity] || amenity}</span>
                                </div>
                            ))}
                        </div>

                        {/* Calendar */}
                        <h3 style={{ fontSize: 20, color: 'var(--navy)', marginBottom: 20, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Disponibilidad</h3>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 28, border: '1px solid var(--gray-100)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <button onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', color: 'var(--gray-600)', display: 'flex' }}><ChevronLeft size={18} /></button>
                                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', textTransform: 'capitalize' }}>{format(calendarMonth, 'MMMM yyyy', { locale: es })}</span>
                                <button onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))} style={{ background: 'var(--gray-50)', border: 'none', borderRadius: 'var(--radius-md)', padding: 8, cursor: 'pointer', color: 'var(--gray-600)', display: 'flex' }}><ChevronRight size={18} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                                {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--gray-400)', padding: '8px 0', textTransform: 'uppercase' }}>{d}</div>
                                ))}
                                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
                                {days.map(day => {
                                    const booked = isDateBooked(day)
                                    return (
                                        <div key={day} style={{
                                            textAlign: 'center', padding: '10px 0', fontSize: 13, fontWeight: 500, borderRadius: 'var(--radius-md)',
                                            cursor: booked ? 'not-allowed' : 'pointer',
                                            color: booked ? 'var(--red)' : 'var(--gray-700)',
                                            background: booked ? 'var(--red-light)' : 'transparent',
                                            textDecoration: booked ? 'line-through' : 'none',
                                            opacity: booked ? 0.7 : 1, transition: 'all 0.2s',
                                        }}
                                            onMouseEnter={(e) => { if (!booked) e.currentTarget.style.background = 'rgba(10,186,181,0.1)' }}
                                            onMouseLeave={(e) => { if (!booked) e.currentTarget.style.background = 'transparent' }}
                                        >{day}</div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Booking Card */}
                    <div>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 28, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--gray-100)', position: 'sticky', top: 90 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 24 }}>
                                <span style={{ fontSize: 32, fontWeight: 700, color: 'var(--turquoise)' }}>${asset.price_per_night}</span>
                                <span style={{ fontSize: 15, color: 'var(--gray-400)' }}>/ noche</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Llegada</label>
                                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="input-field" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Salida</label>
                                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="input-field" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Huéspedes</label>
                                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-field">
                                        {Array.from({ length: asset.capacity }, (_, i) => i + 1).map(n => (
                                            <option key={n} value={n}>{n} {n === 1 ? 'Huésped' : 'Huéspedes'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            {nights > 0 && (
                                <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--gray-600)' }}>
                                        <span>${asset.price_per_night} × {nights} noches</span><span>${subtotal.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--gray-600)' }}>
                                        <span>Tarifa de limpieza</span><span>${cleaningFee}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'var(--gray-600)' }}>
                                        <span>Tarifa de servicio</span><span>${serviceFee}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: 16, fontWeight: 700 }}>
                                        <span style={{ color: 'var(--navy)' }}>Total</span>
                                        <span style={{ color: 'var(--turquoise)' }}>${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            )}
                            <Link href={`/book/${asset.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, fontWeight: 600, borderRadius: 'var(--radius-lg)', marginBottom: 12, textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                                Reservar Ahora
                            </Link>
                            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--gray-400)' }}>No se te cobrará aún</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
