export default function Sidebar({ aktifSayfa, setSayfa }) {
  const navItems = [
    { id: 'ozet', label: 'Anasayfa', ikon: '🏠' },
    { id: 'sozlesmeli', label: 'Sözleşmeli', ikon: '🏢' },
    { id: 'sahsi', label: 'Şahsi', ikon: '💰' },
    { id: 'tarlalar', label: 'Tarlalar', ikon: '🌾' },
    { id: 'hasat', label: 'Hasat', ikon: '🚜' },
    { id: 'kisiler', label: 'Kişiler', ikon: '👥' },
    { id: 'raporlar', label: 'Raporlar', ikon: '📋' },
  ]

  return (
    <aside style={{
      width: 220,
      minHeight: '100dvh',
      background: '#0A5240',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
          🌾 BEDLEK
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
          Tarla Takip & Muhasebe
        </div>
      </div>

      {/* Nav */}
      <nav role="navigation" aria-label="Ana Menü" style={{ padding: '12px 0', flex: 1 }}>
        {navItems.map(item => {
          const aktif = aktifSayfa === item.id
          return (
            <button
              key={item.id}
              onClick={() => setSayfa(item.id)}
              aria-current={aktif ? 'page' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                background: aktif ? 'rgba(255,255,255,0.12)' : 'none',
                border: 'none',
                borderLeft: aktif ? '3px solid #4ADE80' : '3px solid transparent',
                color: aktif ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: 14,
                fontWeight: aktif ? 700 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.ikon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Alt bilgi */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
      }}>
        Bedlek Tarım v1.0
      </div>
    </aside>
  )
}
