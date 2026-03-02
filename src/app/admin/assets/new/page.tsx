'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Anchor, Building2, Ship, Upload, X, Loader2, ImagePlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PREDEFINED_AMENITIES = [
    'WiFi', 'Air Conditioning', 'Full Kitchen', 'Kitchenette', 'Private Balcony', 'Balcony',
    'Ocean View', 'Sea View', 'City View', 'Private Pool', 'Pool Access', 'Beach Access',
    'Garden', 'BBQ Area', 'Parking', 'Hammocks', 'Concierge',
    'Professional Crew', 'Captain Included', 'Professional Chef', 'Full Crew',
    'Snorkeling Gear', 'Jet Ski', 'Kayaks', 'Fishing Equipment',
    'Sound System', 'Sun Deck', 'Jacuzzi', 'Master Suite', 'Premium Bar', 'Cooler with Drinks'
]

const AMENITY_TRANSLATIONS: Record<string, string> = {
    'WiFi': 'WiFi', 'Air Conditioning': 'Aire Acondicionado', 'Full Kitchen': 'Cocina Completa',
    'Kitchenette': 'Cocineta', 'Private Balcony': 'Balcón Privado', 'Balcony': 'Balcón',
    'Ocean View': 'Vista al Mar', 'Sea View': 'Vista al Mar', 'City View': 'Vista a la Ciudad',
    'Private Pool': 'Piscina Privada', 'Pool Access': 'Acceso a Piscina', 'Beach Access': 'Acceso a la Playa',
    'Garden': 'Jardín', 'BBQ Area': 'Área de BBQ', 'Parking': 'Estacionamiento', 'Hammocks': 'Hamacas',
    'Concierge': 'Conserje', 'Professional Crew': 'Tripulación Profesional', 'Captain Included': 'Capitán Incluido',
    'Professional Chef': 'Chef Profesional', 'Full Crew': 'Tripulación Completa', 'Snorkeling Gear': 'Equipo de Snorkel',
    'Jet Ski': 'Moto de Agua', 'Kayaks': 'Kayaks', 'Fishing Equipment': 'Equipo de Pesca',
    'Sound System': 'Sistema de Sonido', 'Sun Deck': 'Terraza / Sun Deck', 'Jacuzzi': 'Jacuzzi',
    'Master Suite': 'Suite Principal', 'Premium Bar': 'Bar Premium', 'Cooler with Drinks': 'Nevera con Bebidas'
}

export default function NewAssetPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        name: '',
        type: 'apartment',
        description: '',
        location: '',
        capacity: 2,
        price_per_night: 0,
        bedrooms: 1,
        bathrooms: 1,
        is_active: true
    })

    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [files, setFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])

            const newUrls = newFiles.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newUrls])
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
        setPreviewUrls(prev => {
            const urls = [...prev]
            URL.revokeObjectURL(urls[index])
            return urls.filter((_, i) => i !== index)
        })
    }

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const supabase = createClient() as any
        if (!supabase) {
            setError('Database connection error')
            setLoading(false)
            return
        }

        try {
            // 1. Upload Images to Storage
            const uploadedUrls: string[] = []

            for (const file of files) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                const filePath = `${formData.type}s/${fileName}`

                const { error: uploadError, data } = await supabase.storage
                    .from('assets')
                    .upload(filePath, file)

                if (uploadError) {
                    throw new Error(`Failed to upload image: ${uploadError.message}. Make sure the 'assets' bucket exists and is public.`)
                }

                if (data) {
                    const { data: publicUrlData } = supabase.storage
                        .from('assets')
                        .getPublicUrl(data.path)

                    uploadedUrls.push(publicUrlData.publicUrl)
                }
            }

            // 2. Save Asset to Database
            const { error: insertError } = await supabase
                .from('assets')
                .insert({
                    name: formData.name,
                    description: formData.description,
                    location: formData.location,
                    capacity: formData.capacity,
                    price_per_night: formData.price_per_night,
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    is_active: formData.is_active,
                    type: formData.type as 'apartment' | 'yacht',
                    amenities: selectedAmenities as import('@/types/database').Json,
                    images: uploadedUrls
                })

            if (insertError) throw insertError

            router.push('/admin/assets')
            router.refresh()

        } catch (err: any) {
            console.error('Error creating asset:', err)
            setError(err.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 4 }}>Añadir Nueva Propiedad</h1>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>Crear un nuevo anuncio de apartamento o yate</p>
                </div>
                <Link href="/admin/assets" className="btn btn-outline" style={{ textDecoration: 'none', fontSize: 13, padding: '8px 16px' }}>
                    Cancelar
                </Link>
            </div>

            {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', padding: '16px 20px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14 }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Type Selection */}
                <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', padding: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>1. Tipo de Propiedad</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, type: 'apartment' }))}
                            style={{
                                background: formData.type === 'apartment' ? 'rgba(10,186,181,0.1)' : 'rgba(255,255,255,0.03)',
                                border: formData.type === 'apartment' ? '1px solid #0ABAB5' : '1px solid rgba(255,255,255,0.08)',
                                padding: 24, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                            }}
                        >
                            <Building2 size={32} color={formData.type === 'apartment' ? '#0ABAB5' : 'rgba(255,255,255,0.4)'} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: formData.type === 'apartment' ? '#0ABAB5' : 'rgba(255,255,255,0.6)' }}>Apartamento</span>
                        </div>
                        <div
                            onClick={() => setFormData(prev => ({ ...prev, type: 'yacht' }))}
                            style={{
                                background: formData.type === 'yacht' ? 'rgba(212,168,83,0.1)' : 'rgba(255,255,255,0.03)',
                                border: formData.type === 'yacht' ? '1px solid #D4A853' : '1px solid rgba(255,255,255,0.08)',
                                padding: 24, borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'all 0.2s',
                            }}
                        >
                            <Ship size={32} color={formData.type === 'yacht' ? '#D4A853' : 'rgba(255,255,255,0.4)'} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: formData.type === 'yacht' ? '#D4A853' : 'rgba(255,255,255,0.6)' }}>Yate</span>
                        </div>
                    </div>
                </div>

                {/* Basic Details */}
                <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', padding: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>2. Información Básica</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                        <div>
                            <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Nombre</label>
                            <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="input-field" placeholder="ej. Penthouse frente al mar" />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
                            <div>
                                <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Ubicación</label>
                                <input type="text" required value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} className="input-field" placeholder="ej. San Luis" />
                            </div>
                            <div>
                                <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Precio por Noche ($)</label>
                                <input type="number" required min="0" step="0.01" value={formData.price_per_night} onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: parseFloat(e.target.value) }))} className="input-field" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20 }}>
                            <div>
                                <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Capacidad / Huéspedes</label>
                                <input type="number" required min="1" value={formData.capacity} onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))} className="input-field" />
                            </div>
                            <div>
                                <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Habitaciones / Cabinas</label>
                                <input type="number" required min="0" value={formData.bedrooms} onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: parseInt(e.target.value) }))} className="input-field" />
                            </div>
                            <div>
                                <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Baños</label>
                                <input type="number" required min="0" value={formData.bathrooms} onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) }))} className="input-field" />
                            </div>
                        </div>

                        <div>
                            <label className="block" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Descripción</label>
                            <textarea required rows={4} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="input-field" placeholder="Describe la propiedad..." style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                </div>

                {/* Amenities */}
                <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', padding: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>3. Comodidades</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {PREDEFINED_AMENITIES.map(amenity => {
                            const selected = selectedAmenities.includes(amenity)
                            return (
                                <div
                                    key={amenity}
                                    onClick={() => toggleAmenity(amenity)}
                                    style={{
                                        padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                                        background: selected ? 'var(--turquoise)' : 'rgba(255,255,255,0.05)',
                                        color: selected ? 'white' : 'rgba(255,255,255,0.6)',
                                        border: selected ? '1px solid var(--turquoise)' : '1px solid rgba(255,255,255,0.1)',
                                    }}
                                >
                                    {AMENITY_TRANSLATIONS[amenity] || amenity}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Images */}
                <div style={{ background: 'rgba(19,31,51,0.6)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.06)', padding: 32 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 20 }}>4. Fotos</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }}>
                        {previewUrls.map((url, i) => (
                            <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}

                        <label style={{
                            aspectRatio: '1', borderRadius: 'var(--radius-md)', border: '2px dashed rgba(255,255,255,0.2)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                            cursor: 'pointer', color: 'rgba(255,255,255,0.5)', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)'
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--turquoise)'; e.currentTarget.style.color = 'var(--turquoise)' }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                        >
                            <ImagePlus size={24} />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>Subir</span>
                            <input type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>
                    </div>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Recomendado: Al menos 3 fotos de alta calidad (JPG, PNG).</p>
                </div>

                {/* Submit */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
                    <Link href="/admin/assets" className="btn btn-outline" style={{ textDecoration: 'none', padding: '14px 24px' }}>
                        Cancelar
                    </Link>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px 32px', minWidth: 160 }}>
                        {loading ? <Loader2 size={18} className="spin" /> : 'Guardar Propiedad'}
                    </button>
                </div>

            </form>
        </div>
    )
}
