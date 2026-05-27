import Link from 'next/link'

export default function Header({ adminMode = false }) {
  return (
    <header className="app-header">
      <Link href="/" className="logo">
        OLINSA <span>· Evaluación de Desempeño 2025</span>
      </Link>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {adminMode && (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Panel Admin
          </span>
        )}
        <Link href="/admin" className="btn btn-gold btn-sm">
          Panel TH
        </Link>
      </div>
    </header>
  )
}
