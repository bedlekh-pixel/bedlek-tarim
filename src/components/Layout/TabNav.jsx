export default function TabNav({ aktifSayfa, setSayfa }) {
  const tabs = [
    { id: 'ozet', label: 'Anasayfa', ikon: '🏠' },
    { id: 'sozlesmeli', label: 'Sözleşmeli', ikon: '🏢' },
    { id: 'sahsi', label: 'Şahsi', ikon: '💰' },
    { id: 'tarlalar', label: 'Tarlalar', ikon: '🌾' },
    { id: 'hasat', label: 'Hasat', ikon: '🚜' },
    { id: 'kisiler', label: 'Kişiler', ikon: '👥' },
    { id: 'raporlar', label: 'Raporlar', ikon: '📋' },
  ]

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        background: '#fff',
        borderTop: '1px solid var(--kenar)',
        display: 'flex',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setSayfa(tab.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: '8px 2px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: aktifSayfa === tab.id ? 'var(--yesil)' : 'var(--yazi-hafif)',
            fontSize: 10,
            fontWeight: aktifSayfa === tab.id ? 700 : 400,
            transition: 'color 0.15s',
            minWidth: 0,
          }}
        >
          <span style={{ fontSize: 20 }}>{tab.ikon}</span>
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', paddingInline: 2 }}>
            {tab.label}
          </span>
          {aktifSayfa === tab.id && (
            <span style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: 2,
              background: 'var(--yesil)',
              borderRadius: '0 0 2px 2px',
            }} />
          )}
        </button>
      ))}
    </nav>
  )
}
