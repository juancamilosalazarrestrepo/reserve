'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Anchor, Search, MapPin, Users, BedDouble, Bath, ChevronRight, Ship, Building2, Star, Instagram, Facebook, Twitter, Menu, X, LogOut, User } from 'lucide-react'
import { useActiveAssets } from '@/hooks/useSupabaseData'
import { useAuth } from '@/context/AuthContext'

type FilterType = 'all' | 'apartment' | 'yacht'

export default function HomePage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const { assets, loading, error } = useActiveAssets()
  const { user, profile, signOut } = useAuth()

  const filteredAssets = assets.filter(a => {
    if (filter === 'all') return true
    return a.type === filter
  })

  const getGradient = (index: number) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #0ABAB5 0%, #006D77 100%)',
      'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    ]
    return gradients[index % gradients.length]
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--white)', overflowX: 'hidden', width: '100%' }}>
      {/* Navigation */}
      <nav className="nav-container" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 40px',
        background: 'rgba(10,22,40,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Anchor size={26} color="#0ABAB5" />
            <span style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: 'white',
              letterSpacing: 3,
            }}>RESERVE</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="desktop-nav">
            {['Explorar', 'Apartamentos', 'Yates', 'Nosotros', 'Contacto'].map(item => (
              <Link key={item} href="#" style={{
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.2s',
                letterSpacing: 0.5,
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#0ABAB5')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
              >{item}</Link>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {user && profile ? (
              <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0ABAB5, #D4A853)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: 'white',
                  }}>
                    {(profile.full_name || user.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: 'white', fontSize: 14, fontWeight: 500, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {profile.full_name || user.email?.split('@')[0]}
                  </span>
                </div>
                {profile.role === 'admin' && (
                  <Link href="/admin" style={{
                    color: '#D4A853', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    border: '1px solid rgba(212,168,83,0.4)',
                  }}>Admin</Link>
                )}
                <Link href="/my-bookings" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>Mis Reservas</Link>
                <button onClick={signOut} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.5)', display: 'flex', padding: 4,
                }}>
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="desktop-auth" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Link href="/login" style={{
                    color: 'rgba(255,255,255,0.8)',
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 500,
                  }}>Iniciar Sesión</Link>
                  <Link href="/register" className="btn btn-primary" style={{
                    padding: '10px 24px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 13,
                  }}>Reservar Ahora</Link>
                </div>
              </>
            )}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}
              className="mobile-menu-btn"
            >
              {mobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenu && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, height: '100vh',
          background: 'rgba(10,22,40,0.98)', backdropFilter: 'blur(20px)', zIndex: 99,
          padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 24,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {['Explorar', 'Apartamentos', 'Yates', 'Nosotros', 'Contacto'].map(item => (
            <Link key={item} href="#" onClick={() => setMobileMenu(false)} style={{
              color: 'white', textDecoration: 'none', fontSize: 20, fontWeight: 500,
            }}>{item}</Link>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '10px 0' }} />

          {!user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Link href="/login" onClick={() => setMobileMenu(false)} style={{
                color: 'white', textDecoration: 'none', fontSize: 18, fontWeight: 500, textAlign: 'center',
                padding: '12px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)'
              }}>Iniciar Sesión</Link>
              <Link href="/register" onClick={() => setMobileMenu(false)} className="btn btn-primary" style={{
                padding: '14px', borderRadius: 'var(--radius-lg)', fontSize: 18, textAlign: 'center'
              }}>Reservar Ahora</Link>
            </div>
          )}
          {user && profile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ABAB5, #D4A853)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: 'white',
                }}>
                  {(profile.full_name || user.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>{profile.full_name || 'Usuario'}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{user.email}</div>
                </div>
              </div>

              <Link href="/my-bookings" onClick={() => setMobileMenu(false)} style={{
                color: 'white', textDecoration: 'none', fontSize: 18, fontWeight: 500, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'
              }}>Mis Reservas</Link>

              {profile.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenu(false)} style={{
                  color: '#D4A853', textDecoration: 'none', fontSize: 18, fontWeight: 500, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>Panel Admin</Link>
              )}

              <button onClick={() => { signOut(); setMobileMenu(false); }} className="btn btn-outline" style={{
                marginTop: 10, padding: '12px', borderRadius: 'var(--radius-lg)', fontSize: 16,
              }}>
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        height: '85vh',
        minHeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(0,109,119,0.7) 40%, rgba(10,186,181,0.5) 70%, rgba(0,109,119,0.8) 100%), url("/banner.webp") center/cover no-repeat',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z\' fill=\'%23ffffff\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40%',
          background: 'linear-gradient(to top, rgba(10,22,40,0.8), transparent)',
        }} />
        <svg style={{ position: 'absolute', bottom: -2, left: 0, right: 0, width: '100%', zIndex: 2 }} viewBox="0 0 1440 120" fill="none">
          <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z" fill="white" />
        </svg>

        <div className="hero-content" style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          maxWidth: 900,
          padding: '0 40px',
          animation: 'fadeIn 1s ease-out',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 20px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            marginBottom: 28,
            backdropFilter: 'blur(8px)',
          }}>
            <Star size={14} color="#D4A853" fill="#D4A853" />
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500, letterSpacing: 1 }}>LUJO EXCLUSIVO EN EL CARIBE</span>
          </div>

          <h1 style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: 'clamp(36px, 5vw, 64px)',
            color: 'white',
            fontWeight: 700,
            marginBottom: 20,
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}>
            Descubre el Paraíso<br />en San Andrés
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: 'rgba(255,255,255,0.8)',
            maxWidth: 600,
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}>
            Exclusivos apartamentos de lujo y yates privados para una experiencia inolvidable en el Caribe
          </p>

          {/* Search Bar */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-xl)',
            padding: 8,
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1 }}>Llegada</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} style={{ display: 'block', width: '100%', border: 'none', outline: 'none', fontSize: 14, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', marginTop: 4, background: 'transparent' }} />
            </div>
            <div style={{ flex: '1 1 160px', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1 }}>Salida</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} style={{ display: 'block', width: '100%', border: 'none', outline: 'none', fontSize: 14, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', marginTop: 4, background: 'transparent' }} />
            </div>
            <div style={{ flex: '1 1 140px', background: 'rgba(255,255,255,0.95)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 1 }}>Tipo</label>
              <select style={{ display: 'block', width: '100%', border: 'none', outline: 'none', fontSize: 14, color: 'var(--navy)', fontFamily: 'Inter, sans-serif', marginTop: 4, background: 'transparent', cursor: 'pointer' }}>
                <option>Todas las Propiedades</option>
                <option>Apartamentos</option>
                <option>Yates</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{ padding: '16px 32px', borderRadius: 'var(--radius-lg)', fontSize: 14, fontWeight: 600, gap: 8, alignSelf: 'stretch' }}>
              <Search size={18} /> Buscar
            </button>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="section-padding" style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 40px 0' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--gray-100)', marginBottom: 40, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 8 }}>
          {[
            { key: 'all' as FilterType, label: 'Todas', icon: <Search size={16} /> },
            { key: 'apartment' as FilterType, label: 'Apartamentos', icon: <Building2 size={16} /> },
            { key: 'yacht' as FilterType, label: 'Yates', icon: <Ship size={16} /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 14,
              fontWeight: filter === tab.key ? 600 : 400,
              color: filter === tab.key ? 'var(--turquoise)' : 'var(--gray-500)',
              borderBottom: filter === tab.key ? '2px solid var(--turquoise)' : '2px solid transparent',
              marginBottom: -2, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
            }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Cargando propiedades...</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--red)' }}>
            <div style={{ fontSize: 16, fontWeight: 500 }}>Error cargando propiedades: {error}</div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAssets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-400)' }}>
            <Building2 size={48} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.5 }} />
            <div style={{ fontSize: 16, fontWeight: 500 }}>No se encontraron propiedades</div>
            <p style={{ fontSize: 14, marginTop: 8 }}>Vuelve pronto para ver nuevas opciones.</p>
          </div>
        )}

        {/* Property Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 28,
          paddingBottom: 80,
        }}>
          {filteredAssets.map((asset, idx) => (
            <Link href={`/assets/${asset.id}`} key={asset.id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both` }}>
                <div style={{
                  height: 240,
                  background: getGradient(idx),
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {Array.isArray(asset.images) && asset.images.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={asset.images[0] as string} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{
                      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: 8, color: 'white',
                    }}>
                      {asset.type === 'yacht' ? <Ship size={48} strokeWidth={1} /> : <Building2 size={48} strokeWidth={1} />}
                      <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.8, letterSpacing: 2, textTransform: 'uppercase' }}>
                        {asset.type === 'yacht' ? 'Yate de Lujo' : 'Apartamento Premium'}
                      </span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: 16, left: 16 }}>
                    <span className={`badge ${asset.type === 'yacht' ? 'badge-navy' : 'badge-turquoise'}`} style={{
                      background: asset.type === 'yacht' ? 'rgba(10,22,40,0.8)' : 'rgba(10,186,181,0.9)',
                      color: 'white', fontSize: 11,
                    }}>
                      {asset.type === 'yacht' ? '⛵ Yate' : '🏢 Apartamento'}
                    </span>
                  </div>
                  <div style={{
                    position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 4,
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 'var(--radius-full)',
                  }}>
                    <Star size={12} color="#D4A853" fill="#D4A853" />
                    <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>4.9</span>
                  </div>
                </div>

                <div style={{ padding: '20px 24px 24px' }}>
                  <h3 style={{
                    fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 600,
                    color: 'var(--navy)', marginBottom: 8, lineHeight: 1.3,
                  }}>{asset.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--gray-500)' }}>
                    <MapPin size={14} />
                    <span style={{ fontSize: 13 }}>{asset.location}, San Andrés</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--gray-100)' }}>
                    {asset.bedrooms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BedDouble size={15} color="var(--gray-400)" />
                        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{asset.bedrooms} Camas</span>
                      </div>
                    )}
                    {asset.bathrooms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Bath size={15} color="var(--gray-400)" />
                        <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{asset.bathrooms} Baños</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={15} color="var(--gray-400)" />
                      <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>{asset.capacity} Huéspedes</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--turquoise)' }}>${asset.price_per_night}</span>
                      <span style={{ fontSize: 13, color: 'var(--gray-400)', marginLeft: 4 }}>/ noche</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--turquoise)' }}>
                      Ver Detalles <ChevronRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-padding" style={{ background: 'var(--navy)', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Anchor size={24} color="#0ABAB5" />
              <span style={{ fontFamily: "'Nunito', sans-serif", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>RESERVE</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
              Arrendamiento de lujo premium en San Andrés. Tu paraíso en el Caribe te espera.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--turquoise)', fontFamily: 'Inter, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Enlaces Rápidos</h4>
            {['Apartamentos', 'Yates', 'Nosotros', 'Contacto'].map(l => (
              <Link key={l} href="#" style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >{l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--turquoise)', fontFamily: 'Inter, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Contacto</h4>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Isla de San Andrés, Colombia</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>+57 300 000 0000</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>info@reserve.co</p>
          </div>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--turquoise)', fontFamily: 'Inter, sans-serif', letterSpacing: 1, textTransform: 'uppercase' }}>Síguenos</h4>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--turquoise)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
                >
                  <Icon size={18} color="white" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
          © 2026 RESERVE. Todos los derechos reservados.
        </div>
      </footer>

      <style jsx>{`
        ::-webkit-scrollbar {
          height: 4px;
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .desktop-auth { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .nav-container { padding: 12px 20px !important; }
          .hero-content { padding: 0 20px !important; }
          .section-padding { padding: 40px 20px 0 !important; }
          .footer-padding { padding: 40px 20px 20px !important; }
          
          /* Force SVG waves to avoid creating extra width if scaled */
          svg { max-width: 100vw; }
        }
      `}</style>
    </div>
  )
}
