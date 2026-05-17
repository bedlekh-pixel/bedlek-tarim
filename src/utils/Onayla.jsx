export default function Onayla({ mesaj, onEvet, onHayir, tehlikeli = true }) {
  return (
    <div
      onClick={onHayir}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, padding: '24px 24px 20px',
          width: '100%', maxWidth: 360,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ fontSize: 15, color: 'var(--yazi)', marginBottom: 20, lineHeight: 1.5 }}>
          {mesaj}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onHayir}
            style={{
              flex: 1, padding: '12px', background: '#F3F4F6',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: 'var(--yazi)',
            }}
          >
            İptal
          </button>
          <button
            onClick={onEvet}
            style={{
              flex: 1, padding: '12px',
              background: tehlikeli ? 'var(--kirmizi)' : 'var(--yesil)',
              border: 'none', borderRadius: 10, cursor: 'pointer',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}
          >
            {tehlikeli ? '🗑️ Evet, Sil' : '✓ Evet'}
          </button>
        </div>
      </div>
    </div>
  )
}
