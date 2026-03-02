'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Phone, Anchor, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!supabase) {
            setError('Database connection error')
            setLoading(false)
            return
        }

        const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    phone,
                },
            },
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        setSuccess(true)
        setLoading(false)
        setTimeout(() => router.push('/login'), 3000)
    }

    if (success) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--gray-50)',
                padding: 40,
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: 400,
                    animation: 'fadeIn 0.6s ease-out',
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'var(--green-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <h2 style={{ fontSize: 24, color: 'var(--navy)', marginBottom: 12 }}>¡Cuenta Creada!</h2>
                    <p style={{ color: 'var(--gray-500)', fontSize: 15 }}>
                        Revisa tu correo para confirmar tu cuenta. Redirigiendo al inicio de sesión...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--gray-50)',
            padding: 40,
        }}>
            <div style={{
                width: '100%',
                maxWidth: 480,
                animation: 'fadeIn 0.6s ease-out',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 40,
                }}>
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, var(--turquoise), var(--navy))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Anchor size={22} color="white" />
                    </div>
                    <span style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--navy)',
                        letterSpacing: 2,
                    }}>RESERVE</span>
                </div>

                <h1 style={{ fontSize: 32, color: 'var(--navy)', marginBottom: 8 }}>Crear Cuenta</h1>
                <p style={{ fontSize: 15, color: 'var(--gray-500)', marginBottom: 36 }}>
                    Únete a nosotros y comienza a reservar tu escapada al Caribe
                </p>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--red-light)',
                        color: 'var(--red)',
                        fontSize: 14,
                        marginBottom: 20,
                    }}>{error}</div>
                )}

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 6 }}>Nombre Completo</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Juan Pérez" className="input-field" style={{ paddingLeft: 42 }} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 6 }}>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="input-field" style={{ paddingLeft: 42 }} required />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 6 }}>Teléfono</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+57 300 000 0000" className="input-field" style={{ paddingLeft: 42 }} />
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 6 }}>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 8 caracteres" className="input-field" style={{ paddingLeft: 42, paddingRight: 42 }} required minLength={8} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 0 }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 600, borderRadius: 'var(--radius-lg)', marginTop: 4, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--gray-500)' }}>
                    ¿Ya tienes una cuenta?{' '}
                    <Link href="/login" style={{ color: 'var(--turquoise)', fontWeight: 600, textDecoration: 'none' }}>Iniciar Sesión</Link>
                </p>
            </div>
        </div>
    )
}
