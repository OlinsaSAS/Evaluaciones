import Link from 'next/link'
import Image from 'next/image'

export default function Header({ adminMode = false }) {
  return (
    <header className="app-header">
      <Link href="/" className="header-logo">
        <img src="/logo.jpeg" alt="Olinsa S.A.S" style={{ height: 42, objectFit: 'contain' }} />
        <div>
          <div style={{ color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
            Evaluación de Desempeño {adminMode ? '— Panel TH' : ''}
          </div>
          <div className="header-tagline">Opción Logística Integral S.A.S · 2026</div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Link href="/admin" className="btn btn-gold btn-sm">
          Panel TH
        </Link>
      </div>
    </header>
  )
}
