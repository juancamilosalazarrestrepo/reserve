'use client'

import { mockAssets } from '@/data/mockData'
import { Users } from 'lucide-react'

export default function AdminUsersPage() {
    const mockUsers = [
        { id: 'c1', name: 'Carlos Mendoza', email: 'carlos@email.com', role: 'client' as const, bookings: 3 },
        { id: 'c2', name: 'María López', email: 'maria@email.com', role: 'client' as const, bookings: 1 },
        { id: 'c3', name: 'John Davis', email: 'john@email.com', role: 'client' as const, bookings: 2 },
        { id: 'c4', name: 'Sofía Ramírez', email: 'sofia@email.com', role: 'client' as const, bookings: 1 },
        { id: 'c5', name: 'Pedro García', email: 'pedro@email.com', role: 'client' as const, bookings: 4 },
        { id: 'a1', name: 'Admin User', email: 'admin@reserve.co', role: 'admin' as const, bookings: 0 },
    ]

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                    Gestión de Usuarios
                </h1>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Gestiona cuentas de usuario y roles</p>
            </div>

            <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 100px 80px 100px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, gap: 12 }}>
                    <span>Nombre</span><span>Correo</span><span>Rol</span><span>Reservas</span><span style={{ textAlign: 'center' }}>Acciones</span>
                </div>
                {mockUsers.map((user, idx) => (
                    <div key={user.id} style={{
                        display: 'grid', gridTemplateColumns: '2fr 2fr 100px 80px 100px', padding: '16px 20px',
                        borderBottom: idx < mockUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        alignItems: 'center', gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                background: user.role === 'admin' ? 'linear-gradient(135deg, #D4A853, #B8860B)' : 'linear-gradient(135deg, #0ABAB5, #006D77)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 13, fontWeight: 600, color: 'white',
                            }}>{user.name.charAt(0)}</div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{user.name}</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{user.email}</span>
                        <span className="badge" style={{
                            background: user.role === 'admin' ? 'rgba(212,168,83,0.15)' : 'rgba(10,186,181,0.15)',
                            color: user.role === 'admin' ? '#D4A853' : '#0ABAB5',
                            fontSize: 10, justifySelf: 'start', textTransform: 'capitalize',
                        }}>{user.role}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{user.bookings}</span>
                        <div style={{ textAlign: 'center' }}>
                            <select style={{
                                padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 'var(--radius-sm)', color: 'white', fontSize: 12, cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif',
                            }} defaultValue={user.role}>
                                <option value="client">Cliente</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
