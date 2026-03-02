'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Anchor, LayoutDashboard, Building2, CalendarDays, Users, Settings, LogOut, Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { profile, signOut } = useAuth()

    const navItems = [
        { href: '/admin', label: 'Panel', icon: LayoutDashboard },
        { href: '/admin/assets', label: 'Propiedades', icon: Building2 },
        { href: '/admin/reservations', label: 'Reservas', icon: CalendarDays },
        { href: '/admin/users', label: 'Usuarios', icon: Users },
        { href: '/admin/settings', label: 'Configuración', icon: Settings },
    ]

    const handleSignOut = async () => {
        await signOut()
        router.push('/login')
    }

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: '#0A1628',
            color: 'white',
        }}>
            {/* Sidebar */}
            <aside style={{
                width: 260,
                background: '#06101F',
                borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                zIndex: 50,
            }}>
                <div style={{ padding: '24px 24px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                            background: 'linear-gradient(135deg, #0ABAB5, #006D77)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Anchor size={20} color="white" />
                        </div>
                        <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, color: 'white', letterSpacing: 3 }}>RESERVE</span>
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.5, padding: '0 12px', marginBottom: 8 }}>Menú Principal</span>
                    {navItems.map(item => {
                        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                        const Icon = item.icon
                        return (
                            <Link key={item.href} href={item.href} style={{
                                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                                borderRadius: 'var(--radius-md)', textDecoration: 'none', fontSize: 14,
                                fontWeight: isActive ? 600 : 400,
                                color: isActive ? '#0ABAB5' : 'rgba(255,255,255,0.6)',
                                background: isActive ? 'rgba(10,186,181,0.1)' : 'transparent',
                                transition: 'all 0.2s', position: 'relative',
                            }}>
                                {isActive && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 3, borderRadius: 4, background: '#0ABAB5' }} />}
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                {/* User Profile */}
                <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)',
                        background: 'linear-gradient(135deg, #0ABAB5, #D4A853)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600,
                    }}>
                        {(profile?.full_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{profile?.full_name || 'Admin'}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{profile?.role || 'admin'}</div>
                    </div>
                    <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ marginLeft: 260, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <header style={{
                    padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, background: 'rgba(6,16,31,0.5)', backdropFilter: 'blur(8px)',
                    position: 'sticky', top: 0, zIndex: 40,
                }}>
                    <Link href="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                        ← Volver al Sitio
                    </Link>
                    <button style={{
                        position: 'relative', background: 'rgba(255,255,255,0.06)', border: 'none',
                        borderRadius: 'var(--radius-md)', padding: 10, cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
                    }}>
                        <Bell size={18} />
                        <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid #06101F' }} />
                    </button>
                </header>
                <div style={{ flex: 1, padding: '24px 32px', overflow: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    )
}
