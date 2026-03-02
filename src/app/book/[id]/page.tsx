'use client'

import { use, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Anchor, Check, Calendar, Users as UsersIcon, CreditCard, ArrowLeft, Ship, Building2, Loader2, ShieldCheck } from 'lucide-react'
import { useAsset } from '@/hooks/useSupabaseData'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const searchParams = useSearchParams()
    const router = useRouter()

    const { asset, loading: assetLoading } = useAsset(id)
    const { user, profile } = useAuth()

    const [step, setStep] = useState(1)
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [notes, setNotes] = useState('')

    const [isProcessingPayment, setIsProcessingPayment] = useState(false)
    const [bookingSuccess, setBookingSuccess] = useState(false)

    // Pre-fill user data if logged in
    useEffect(() => {
        if (profile) {
            setGuestName(profile.full_name || '')
            setGuestPhone(profile.phone || '')
        }
        if (user) {
            setGuestEmail(user.email || '')
        }
    }, [user, profile])

    const checkIn = searchParams.get('checkIn') || ''
    const checkOut = searchParams.get('checkOut') || ''
    const guests = Number(searchParams.get('guests')) || 2

    if (assetLoading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spin" size={32} color="var(--turquoise)" /></div>
    }

    if (!asset) {
        return <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}><h1>Propiedad no encontrada</h1><Link href="/" className="btn btn-primary" style={{ marginTop: 20 }}>Volver al Inicio</Link></div>
    }

    const nights = checkIn && checkOut ?
        Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0
    const subtotal = nights * asset.price_per_night
    const cleaningFee = 120
    const serviceFee = Math.round(subtotal * 0.04)
    const total = subtotal + cleaningFee + serviceFee

    const steps = [
        { num: 1, label: 'Datos', icon: UsersIcon },
        { num: 2, label: 'Pago', icon: CreditCard },
        { num: 3, label: 'Confirmación', icon: Check },
    ]

    const handleSimulatePayment = async () => {
        if (!user) {
            alert('Debes iniciar sesión para completar la reserva');
            router.push('/login');
            return;
        }

        setIsProcessingPayment(true)

        // Simular tiempo de procesamiento de MercadoPago (2 segundos)
        setTimeout(async () => {
            const supabase = createClient()
            if (!supabase) {
                alert("Error de conexión a la base de datos. Cliente no inicializado.")
                setIsProcessingPayment(false)
                return
            }

            // @ts-expect-error - Supabase generic types from SSR sometimes map as never in Next.js Strict Mode
            const { error } = await supabase.from('reservations').insert({
                asset_id: asset.id,
                client_id: user.id,
                check_in: checkIn,
                check_out: checkOut,
                status: 'confirmed',
                total_price: total,
                guest_name: guestName,
                notes: notes
            })

            setIsProcessingPayment(false)

            if (error) {
                console.error("Error creating reservation", error)
                alert("Hubo un error al procesar tu reserva. Intenta de nuevo.")
            } else {
                setBookingSuccess(true)
                setStep(3)
            }
        }, 2500)
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
            {/* Nav */}
            <nav style={{ background: 'white', padding: '16px 40px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <Anchor size={24} color="#0ABAB5" />
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: 2 }}>RESERVE</span>
                    </Link>
                    <Link href={`/assets/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--gray-500)', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Volver a la Propiedad
                    </Link>
                </div>
            </nav>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px' }}>
                {/* Steps */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 48 }}>
                    {steps.map(s => {
                        const Icon = s.icon
                        const isActive = step === s.num
                        const isCompleted = step > s.num
                        return (
                            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%',
                                    background: isCompleted ? 'var(--green)' : isActive ? 'var(--turquoise)' : 'var(--gray-200)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', transition: 'all 0.3s',
                                }}>
                                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                                </div>
                                <span style={{
                                    fontSize: 14, fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--navy)' : 'var(--gray-400)',
                                }}>{s.label}</span>
                            </div>
                        )
                    })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
                    {/* Main content */}
                    <div>
                        {step === 1 && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', animation: 'fadeIn 0.4s ease-out' }}>
                                {!user && (
                                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14 }}>
                                        <strong>¡Atención!</strong> Debes iniciar sesión para poder reservar esta propiedad. <Link href="/login" style={{ color: 'inherit', textDecoration: 'underline' }}>Inicia sesión aquí</Link>.
                                    </div>
                                )}
                                <h2 style={{ fontSize: 22, color: 'var(--navy)', marginBottom: 24 }}>Datos del Huésped</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Nombre Completo</label>
                                        <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Juan Pérez" className="input-field" disabled={!user} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Correo Electrónico</label>
                                            <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="juan@email.com" className="input-field" disabled={!user} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Teléfono</label>
                                            <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+57 300 000 0000" className="input-field" disabled={!user} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, display: 'block' }}>Peticiones Especiales</label>
                                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Cualquier petición especial o nota..." className="input-field" rows={3} style={{ resize: 'vertical' }} disabled={!user} />
                                    </div>
                                </div>
                                <button onClick={() => setStep(2)} className="btn btn-primary" style={{ width: '100%', padding: 16, fontSize: 15, fontWeight: 600, borderRadius: 'var(--radius-lg)' }} disabled={!user}>
                                    Continuar al Pago Seguro
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 32, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', animation: 'fadeIn 0.4s ease-out' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
                                    <h2 style={{ fontSize: 22, color: 'var(--navy)', margin: 0 }}>Pago Seguro</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--turquoise)', background: 'rgba(10, 186, 181, 0.1)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
                                        <ShieldCheck size={16} />
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>MercadoPago</span>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--gray-50)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', marginBottom: 32 }}>
                                    <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 16 }}>
                                        Estás realizando el pago de tu reserva a través de una simulación segura de <strong>MercadoPago</strong>. No se realizarán cargos reales a tu cuenta.
                                    </p>

                                    <div style={{ background: 'white', padding: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)', display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{ width: 48, height: 32, background: 'var(--navy)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CreditCard size={20} color="white" />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>Tarjeta Termina en •••• 1234</div>
                                            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>Simulación de Tarjeta Bancaria</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button onClick={() => setStep(1)} className="btn btn-ghost" style={{ flex: 1, padding: 16, fontSize: 15, fontWeight: 600, borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }} disabled={isProcessingPayment}>
                                        Volver
                                    </button>
                                    <button onClick={handleSimulatePayment} className="btn btn-primary" style={{ flex: 2, padding: 16, fontSize: 15, fontWeight: 600, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#009EE3', borderColor: '#009EE3' }} disabled={isProcessingPayment}>
                                        {isProcessingPayment ? <><Loader2 className="spin" size={18} /> Procesando Pago...</> : `Pagar $${total.toLocaleString()} - MercadoPago`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && bookingSuccess && (
                            <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 40, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', animation: 'fadeIn 0.4s ease-out', textAlign: 'center' }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: '50%', background: 'var(--green-light)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                                }}>
                                    <Check size={40} color="var(--green)" />
                                </div>
                                <h2 style={{ fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>¡Reserva Aprobada!</h2>
                                <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                                    El pago a través de MercadoPago fue exitoso. Tu reserva para <strong>{asset.name}</strong> ha quedado confirmada.
                                </p>
                                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'left', marginBottom: 32, border: '1px solid var(--gray-200)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                        <div><span style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Código Booking</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>#RSV-{Math.floor(Math.random() * 90000) + 10000}</div></div>
                                        <div><span style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Recibo MercadoPago</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>#MP-{Math.floor(Math.random() * 9000000) + 1000000}</div></div>
                                        <div><span style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Titular</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginTop: 4 }}>{guestName || 'Huésped'}</div></div>
                                        <div><span style={{ fontSize: 12, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 1 }}>Total Pagado</span><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)', marginTop: 4 }}>${total.toLocaleString()}</div></div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Link href="/" className="btn btn-ghost" style={{ flex: 1, padding: 16, fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)', textDecoration: 'none' }}>
                                        Volver a Inicio
                                    </Link>
                                    <Link href="/my-bookings" className="btn btn-primary" style={{ flex: 1, padding: 16, fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius-lg)', textDecoration: 'none' }}>
                                        Ver Mis Reservas
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Summary */}
                    <div>
                        <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 24, boxShadow: 'var(--shadow-sm)', border: '1px solid var(--gray-100)', position: 'sticky', top: 90 }}>
                            <div style={{
                                width: '100%', height: 160, borderRadius: 'var(--radius-lg)', marginBottom: 16,
                                background: `linear-gradient(135deg, ${asset.type === 'yacht' ? '#0ABAB5, #006D77' : '#667eea, #764ba2'})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', overflow: 'hidden', position: 'relative'
                            }}>
                                {Array.isArray(asset.images) && asset.images.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={asset.images[0] as string} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                                ) : (
                                    asset.type === 'yacht' ? <Ship size={36} strokeWidth={1} /> : <Building2 size={36} strokeWidth={1} />
                                )}
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, fontFamily: 'Inter, sans-serif' }}>{asset.name}</h3>
                            <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>{asset.location}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Llegada:</span>
                                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{checkIn}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Salida:</span>
                                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{checkOut}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Huéspedes:</span>
                                    <span style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 600 }}>{guests} Personas</span>
                                </div>
                            </div>

                            {nights > 0 && (
                                <>
                                    <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                                            <span>${asset.price_per_night} × {nights} noches</span>
                                            <span>${subtotal.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--gray-600)' }}>
                                            <span>Tarifa de limpieza</span>
                                            <span>${cleaningFee}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13, color: 'var(--gray-600)' }}>
                                            <span>Tarifa de servicio</span>
                                            <span>${serviceFee}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--gray-100)', fontSize: 18, fontWeight: 700 }}>
                                            <span style={{ color: 'var(--navy)' }}>Total</span>
                                            <span style={{ color: 'var(--turquoise)' }}>${total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
