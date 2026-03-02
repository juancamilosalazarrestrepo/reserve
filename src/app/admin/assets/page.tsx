'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Building2, Ship, MapPin, Users, Filter } from 'lucide-react'
import { useAssets } from '@/hooks/useSupabaseData'
import { createClient } from '@/lib/supabase/client'
import type { Asset } from '@/types/database'
import Link from 'next/link'

export default function AdminAssetsPage() {
    const { assets, loading, refetch } = useAssets()
    const [searchQuery, setSearchQuery] = useState('')
    const [filterType, setFilterType] = useState<'all' | 'apartment' | 'yacht'>('all')

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.location?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || a.type === filterType
        return matchesSearch && matchesType
    })

    const toggleActive = async (id: string, currentActive: boolean) => {
        const supabase = createClient() as any
        if (!supabase) return

        await supabase.from('assets').update({ is_active: !currentActive }).eq('id', id)
        refetch()
    }

    const getGradient = (index: number) => {
        const gradients = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #0ABAB5, #006D77)',
            'linear-gradient(135deg, #a18cd1, #fbc2eb)',
            'linear-gradient(135deg, #ffecd2, #fcb69f)',
        ]
        return gradients[index % gradients.length]
    }

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'rgba(255,255,255,0.5)' }}>Cargando propiedades...</div>
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>Gestión de Propiedades</h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Gestiona tu inventario de apartamentos y yates ({assets.length} en total)</p>
                </div>
                <Link href="/admin/assets/new" className="btn btn-primary" style={{ fontSize: 13, textDecoration: 'none' }}>
                    <Plus size={16} /> Agregar Propiedad
                </Link>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar propiedades..." style={{ width: '100%', padding: '12px 16px 12px 42px', background: 'rgba(19,31,51,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: 14, outline: 'none', fontFamily: 'Inter, sans-serif' }} />
                </div>
                <div style={{ position: 'relative' }}>
                    <Filter size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value as 'all' | 'apartment' | 'yacht')} style={{ padding: '12px 16px 12px 38px', background: 'rgba(19,31,51,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', color: 'white', fontSize: 14, outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', appearance: 'none', paddingRight: 32 }}>
                        <option value="all">Todos los Tipos</option>
                        <option value="apartment">Apartamentos</option>
                        <option value="yacht">Yates</option>
                    </select>
                </div>
            </div>

            <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 1fr 80px 100px 80px 100px', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, gap: 12 }}>
                    <span>Propiedad</span><span>Tipo</span><span>Ubicación</span><span>Capacidad</span><span>Precio/Noche</span><span>Estado</span><span style={{ textAlign: 'center' }}>Acciones</span>
                </div>

                {filteredAssets.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No se encontraron propiedades</div>
                )}

                {filteredAssets.map((asset, idx) => (
                    <div key={asset.id} style={{
                        display: 'grid', gridTemplateColumns: '2fr 100px 1fr 80px 100px 80px 100px', padding: '16px 20px',
                        borderBottom: idx < filteredAssets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        alignItems: 'center', gap: 12, transition: 'all 0.2s', cursor: 'pointer',
                    }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: getGradient(idx), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {Array.isArray(asset.images) && asset.images.length > 0 ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={asset.images[0] as string} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    asset.type === 'yacht' ? <Ship size={16} color="white" /> : <Building2 size={16} color="white" />
                                )}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'white' }}>{asset.name}</span>
                        </div>
                        <span className="badge" style={{ background: asset.type === 'yacht' ? 'rgba(212,168,83,0.15)' : 'rgba(10,186,181,0.15)', color: asset.type === 'yacht' ? '#D4A853' : '#0ABAB5', fontSize: 10, justifySelf: 'start' }}>
                            {asset.type === 'yacht' ? '⛵ Yate' : '🏢 Apto'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={13} color="rgba(255,255,255,0.3)" />
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{asset.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Users size={13} color="rgba(255,255,255,0.3)" />
                            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{asset.capacity}</span>
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0ABAB5' }}>${asset.price_per_night}</span>
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(asset.id, asset.is_active) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: asset.is_active ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 500 }}>
                            {asset.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                        </button>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(10,186,181,0.2)'; e.currentTarget.style.color = '#0ABAB5' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                            ><Pencil size={14} /></button>
                            <button style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 'var(--radius-sm)', padding: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', transition: 'all 0.2s' }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#EF4444' }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                            ><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
