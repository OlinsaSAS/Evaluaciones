function getCategoria(score) {
  if (!score) return { label: 'Sin datos', emoji: '—' }
  if (score >= 4.5) return { label: 'Excepcional', emoji: '⭐' }
  if (score >= 3.5) return { label: 'Alto Desempeño', emoji: '🏆' }
  if (score >= 2.5) return { label: 'Satisfactorio', emoji: '✅' }
  if (score >= 1.5) return { label: 'En Mejora', emoji: '📈' }
  return { label: 'Crítico', emoji: '⚠️' }
}

export default function ScoreBar({ scores, label = 'Puntaje Total' }) {
  const validScores = Object.values(scores).filter(v => v > 0)
  const avg = validScores.length
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(2)
    : null
  const cat = getCategoria(avg ? parseFloat(avg) : null)
  const pct = avg ? (parseFloat(avg) / 5) * 100 : 0

  return (
    <div className="total-bar">
      <div>
        <div className="lbl">{label}</div>
        <div className="progress-wrap">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="val">{avg ? `${avg} / 5.0` : '—'}</div>
        <div className="cat">{cat.emoji} {cat.label}</div>
      </div>
    </div>
  )
}

export { getCategoria }
