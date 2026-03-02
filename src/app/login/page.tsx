'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Anchor } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClient() as any

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!supabase) {
            setError('Database connection error')
            setLoading(false)
            return
        }

        const { data, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (loginError) {
            setError(loginError.message)
            setLoading(false)
            return
        }

        // Check user role and redirect
        if (data.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single()

            if (profile?.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/')
            }
        }

        setLoading(false)
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--white)',
        }}>
            {/* Left Side - Image */}
            <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                display: 'none',
            }} className="login-image-panel">
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #006D77 0%, #0A1628 50%, #0ABAB5 100%)',
                }}>
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '60%',
                        background: 'linear-gradient(to top, rgba(10,22,40,0.9), transparent)',
                    }} />
                </div>

                {/* Decorative content on left */}
                <div style={{
                    position: 'absolute',
                    top: 40,
                    left: 40,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    zIndex: 10,
                }}>
                    <Anchor size={28} color="white" />
                    <span style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 24,
                        fontWeight: 700,
                        color: 'white',
                        letterSpacing: 2,
                    }}>RESERVE</span>
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: 80,
                    left: 40,
                    right: 40,
                    zIndex: 10,
                }}>
                    <h2 style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontSize: 36,
                        color: 'white',
                        marginBottom: 16,
                        lineHeight: 1.2,
                    }}>
                        Tu Paraíso en el<br />Caribe te Espera
                    </h2>
                    <p style={{
                        fontSize: 16,
                        color: 'rgba(255,255,255,0.7)',
                        lineHeight: 1.6,
                        maxWidth: 400,
                    }}>
                        Descubre exclusivos apartamentos de lujo y yates privados en la impresionante Isla de San Andrés.
                    </p>
                </div>

                {/* Decorative circles */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    border: '1px solid rgba(10,186,181,0.2)',
                    zIndex: 5,
                }} />
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    right: '-5%',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    border: '1px solid rgba(10,186,181,0.15)',
                    zIndex: 5,
                }} />
            </div>

            {/* Right Side - Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                background: 'var(--gray-50)',
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 440,
                    animation: 'fadeIn 0.6s ease-out',
                }}>
                    {/* Logo */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 48,
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

                    {/* Heading */}
                    <h1 style={{
                        fontSize: 32,
                        color: 'var(--navy)',
                        marginBottom: 8,
                    }}>Bienvenido de Nuevo</h1>
                    <p style={{
                        fontSize: 15,
                        color: 'var(--gray-500)',
                        marginBottom: 36,
                    }}>Inicia sesión para gestionar tus experiencias de lujo</p>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--red-light)',
                            color: 'var(--red)',
                            fontSize: 14,
                            marginBottom: 20,
                            border: '1px solid rgba(239,68,68,0.2)',
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--gray-700)',
                                marginBottom: 6,
                            }}>Correo Electrónico</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@correo.com"
                                    className="input-field"
                                    style={{ paddingLeft: 42 }}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--gray-700)',
                                marginBottom: 6,
                            }}>Contraseña</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} style={{
                                    position: 'absolute',
                                    left: 14,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--gray-400)',
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    className="input-field"
                                    style={{ paddingLeft: 42, paddingRight: 42 }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: 14,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: 'var(--gray-400)',
                                        padding: 0,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontSize: 13,
                                color: 'var(--gray-600)',
                                cursor: 'pointer',
                            }}>
                                <input type="checkbox" style={{
                                    width: 16,
                                    height: 16,
                                    accentColor: 'var(--turquoise)',
                                    cursor: 'pointer',
                                }} />
                                Recordarme
                            </label>
                            <Link href="#" style={{
                                fontSize: 13,
                                color: 'var(--turquoise)',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}>¿Olvidaste tu contraseña?</Link>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                fontSize: 15,
                                fontWeight: 600,
                                borderRadius: 'var(--radius-lg)',
                                marginTop: 4,
                                opacity: loading ? 0.7 : 1,
                            }}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        margin: '28px 0',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                        <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>o continuar con</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--gray-200)' }} />
                    </div>

                    {/* Social login */}
                    <button style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--gray-200)',
                        background: 'var(--white)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'var(--gray-700)',
                        transition: 'all var(--transition-fast)',
                    }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--gray-50)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--white)')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continuar con Google
                    </button>

                    {/* Sign up link */}
                    <p style={{
                        textAlign: 'center',
                        marginTop: 28,
                        fontSize: 14,
                        color: 'var(--gray-500)',
                    }}>
                        ¿No tienes una cuenta?{' '}
                        <Link href="/register" style={{
                            color: 'var(--turquoise)',
                            fontWeight: 600,
                            textDecoration: 'none',
                        }}>Regístrate</Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
        @media (min-width: 768px) {
          .login-image-panel {
            display: block !important;
          }
        }
      `}</style>
        </div>
    )
}
