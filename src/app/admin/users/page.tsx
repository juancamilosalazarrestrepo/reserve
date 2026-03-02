'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

type UserWithStats = Profile & {
    bookings: number;
    email: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            const supabase = createClient()
            if (!supabase) return

            // We need auth.users for emails, and profiles for roles/names
            // Since we can't easily query auth.users from client due to security,
            // we'll fetch profiles. The email should technically be synced or fetched securely.
            // But we'll do our best with profiles first.
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching profiles:', error)
                setLoading(false)
                return
            }

            // Fetch reservation counts
            const { data: rawReservations } = await supabase
                .from('reservations')
                .select('client_id')
            const reservations = rawReservations as unknown as { client_id: string }[] | null

            const accStats = reservations?.reduce((acc, curr) => {
                acc[curr.client_id] = (acc[curr.client_id] || 0) + 1
                return acc
            }, {} as Record<string, number>) || {}

            const typedProfiles = (profiles || []) as unknown as Profile[]
            const usersWithStats: UserWithStats[] = typedProfiles.map((p: Profile) => ({
                ...p,
                email: p.id, // Placeholder, as getting full auth.users list usually requires Admin API
                bookings: accStats[p.id] || 0
            }))

            setUsers(usersWithStats)
            setLoading(false)
        }

        fetchUsers()
    }, [])

    const handleRoleChange = async (userId: string, newRole: string) => {
        const supabase = createClient()
        if (!supabase) return

        // Optimistic UI update
        const previousUsers = [...users]
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as 'admin' | 'client' } : u))

        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole } as never)
            .eq('id' as never, userId as never)

        if (error) {
            console.error('Error updating user role:', error)
            alert('Error updating user role. Please try again.')
            // Revert changes on error
            setUsers(previousUsers)
        }
    }

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
                    <span>Nombre</span><span>ID (Correo)</span><span>Rol</span><span>Reservas</span><span style={{ textAlign: 'center' }}>Acciones</span>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Cargando usuarios...</div>
                ) : (
                    users.map((user, idx) => (
                        <div key={user.id} style={{
                            display: 'grid', gridTemplateColumns: '2fr 2fr 100px 80px 100px', padding: '16px 20px',
                            borderBottom: idx < users.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                            alignItems: 'center', gap: 12,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 'var(--radius-md)',
                                    background: user.role === 'admin' ? 'linear-gradient(135deg, #D4A853, #B8860B)' : 'linear-gradient(135deg, #0ABAB5, #006D77)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 600, color: 'white',
                                }}>{(user.full_name || '?').charAt(0).toUpperCase()}</div>
                                <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{user.full_name || 'Usuario'}</span>
                            </div>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.id}</span>
                            <span className="badge" style={{
                                background: user.role === 'admin' ? 'rgba(212,168,83,0.15)' : 'rgba(10,186,181,0.15)',
                                color: user.role === 'admin' ? '#D4A853' : '#0ABAB5',
                                fontSize: 10, justifySelf: 'start', textTransform: 'capitalize',
                            }}>{user.role === 'admin' ? 'Admin' : 'Cliente'}</span>
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>{user.bookings}</span>
                            <div style={{ textAlign: 'center' }}>
                                <select
                                    style={{
                                        padding: '6px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: 'var(--radius-sm)', color: 'white', fontSize: 12, cursor: 'pointer', outline: 'none', fontFamily: 'Inter, sans-serif',
                                    }}
                                    value={user.role || 'client'}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    <option value="client">Cliente</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
