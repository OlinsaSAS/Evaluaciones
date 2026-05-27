import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import RatingRow from '../components/RatingRow'
import ScoreBar from '../components/ScoreBar'
import { supabase } from '../lib/supabase'

// ── Datos de competencias ──────────────────────────────────────────────────
const COMP_ORG = [
  { nombre: 'Compromiso y responsabilidad', detalle: 'Cumple funciones en el tiempo, forma y calidad requeridos.' },
  { nombre: 'Trabajo en equipo', detalle: 'Colabora activamente y apoya a compañeros para lograr objetivos comunes.' },
  { nombre: 'Orientación al cliente', detalle: 'Atiende con diligencia las necesidades del cliente interno y externo.' },
  { nombre: 'Seguridad y calidad', detalle: 'Aplica los protocolos de seguridad y estándares de calidad de OLINSA.' },
  { nombre: 'Actitud y adaptabilidad', detalle: 'Se adapta a cambios y mantiene actitud positiva ante retos operativos.' },
]
const COMP_TEC = [
  { nombre: 'Conocimiento del cargo', detalle: 'Domina los conocimientos técnicos necesarios para su función.' },
  { nombre: 'Calidad del trabajo', detalle: 'Sus resultados son precisos, completos y requieren pocos reprocesos.' },
  { nombre: 'Gestión de tiempo', detalle: 'Organiza tareas eficientemente y cumple los plazos establecidos.' },
  { nombre: 'Reporte y comunicación', detalle: 'Informa oportunamente sobre avances, fallas o novedades.' },
  { nombre: 'Iniciativa y mejora', detalle: 'Identifica oportunidades de mejora y propone soluciones.' },
]
const COMP_JEFE_A = [
  { nombre: 'Compromiso y responsabilidad', detalle: 'Cumple funciones en el tiempo, forma y calidad requeridos sin supervisión constante.' },
  { nombre: 'Trabajo en equipo', detalle: 'Colabora, comparte información y apoya el logro de objetivos colectivos.' },
  { nombre: 'Orientación al cliente', detalle: 'Gestiona con diligencia y soluciones efectivas las necesidades del cliente.' },
  { nombre: 'Seguridad y calidad', detalle: 'Cumple y promueve los protocolos de seguridad y estándares de calidad.' },
  { nombre: 'Comunicación efectiva', detalle: 'Se expresa con claridad verbal y escrita; escucha activamente.' },
]
const COMP_JEFE_B = [
  { nombre: 'Dominio técnico del cargo', detalle: 'Demuestra el conocimiento técnico y normativo requerido.' },
  { nombre: 'Calidad del trabajo', detalle: 'Produce resultados precisos y completos con bajo nivel de reproceso.' },
  { nombre: 'Planeación y organización', detalle: 'Gestiona su tiempo y recursos de manera eficiente; cumple cronogramas.' },
  { nombre: 'Resolución de problemas', detalle: 'Identifica problemas y propone soluciones oportunas y pertinentes.' },
  { nombre: 'Iniciativa y mejora continua', detalle: 'Actúa proactivamente y propone mejoras sin esperar instrucciones.' },
]
const COMP_JEFE_C = [
  { nombre: 'Desarrollo del equipo', detalle: 'Orienta, retroalimenta y promueve el crecimiento de su equipo.' },
  { nombre: 'Toma de decisiones', detalle: 'Decide con oportunidad y criterio; asume responsabilidad por resultados.' },
  { nombre: 'Gestión del clima laboral', detalle: 'Promueve un ambiente de trabajo respetuoso y de alto rendimiento.' },
]
const COMP_PARES_A = [
  { nombre: 'Colaboración', detalle: 'Apoya a sus compañeros, comparte información y recursos sin dificultad.' },
  { nombre: 'Comunicación', detalle: 'Se comunica de forma clara, respetuosa y oportuna.' },
  { nombre: 'Confiabilidad', detalle: 'Cumple los compromisos con el equipo; es puntual en entregas y reuniones.' },
  { nombre: 'Actitud', detalle: 'Mantiene actitud positiva y constructiva en situaciones difíciles.' },
  { nombre: 'Respeto', detalle: 'Trata a todos con respeto y dignidad, independientemente del cargo.' },
]
const COMP_PARES_B = [
  { nombre: 'Calidad del trabajo', detalle: 'Su trabajo es confiable; no genera reprocesos ni inconvenientes a otros.' },
  { nombre: 'Proactividad', detalle: 'Identifica problemas o necesidades y actúa antes de que se le indique.' },
  { nombre: 'Cumplimiento de responsabilidades', detalle: 'Cumple sus funciones sin necesitar recordatorios constantes.' },
  { nombre: 'Aporte al ambiente laboral', detalle: 'Contribuye a un ambiente de trabajo positivo y motivador.' },
  { nombre: 'Orientación al resultado', detalle: 'Mantiene el foco en los objetivos del área y apoya metas colectivas.' },
]

function avg(obj) {
  const vals = Object.values(obj).filter(v => v > 0)
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
}

// ── Formulario Autoevaluación ──────────────────────────────────────────────
function FormAutoeval({ evaluado, onSubmit, saving }) {
  const [ra, setRa] = useState({})
  const [rb, setRb] = useState({})
  const [reflexion, setReflexion] = useState({ fortaleza: '', apoyo: '', compromiso: '' })

  const scoreA = avg(ra), scoreB = avg(rb)
  const scoreTotal = [scoreA, scoreB].filter(s => s > 0)
  const prom = scoreTotal.length ? scoreTotal.reduce((a, b) => a + b, 0) / scoreTotal.length : 0

  function handleSubmit() {
    if (Object.keys(ra).length < 5 || Object.keys(rb).length < 5) {
      alert('Por favor califica todos los criterios antes de enviar.')
      return
    }
    onSubmit({ ra, rb, reflexion, puntaje_final: parseFloat(prom.toFixed(2)) })
  }

  return (
    <div>
      <div className="alert alert-info">
        Selecciona la calificación que mejor describe tu desempeño en los <strong>últimos 6 meses</strong>. No hay respuestas incorrectas.
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ background: 'var(--cyan)' }}>
          <h2>A. Competencias Organizacionales</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_ORG.map((c, i) => (
            <RatingRow key={i} num={i + 1} nombre={c.nombre} detalle={c.detalle}
              value={ra[i + 1]} onChange={v => setRa({ ...ra, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--cyan)' }}>
          <h2>B. Competencias Técnicas</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_TEC.map((c, i) => (
            <RatingRow key={i} num={i + 6} nombre={c.nombre} detalle={c.detalle}
              value={rb[i + 1]} onChange={v => setRb({ ...rb, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--cyan)' }}>
          <h2>Reflexión Personal</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['fortaleza', '1. ¿Cuál es tu mayor fortaleza en el desempeño de tu cargo?'],
              ['apoyo', '2. ¿En qué aspecto necesitas mayor apoyo, formación o recursos?'],
              ['compromiso', '3. ¿Qué compromiso personal asumes para el próximo período?'],
            ].map(([key, label]) => (
              <div className="form-field" key={key}>
                <label>{label}</label>
                <textarea value={reflexion[key]} onChange={e => setReflexion({ ...reflexion, [key]: e.target.value })} placeholder="Escribe tu respuesta…" />
              </div>
            ))}
          </div>
        </div>
        <ScoreBar scores={{ a: scoreA, b: scoreB }} label="Puntaje Autoevaluación" />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
        style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, marginTop: 8 }}>
        {saving ? 'Guardando…' : 'Enviar autoevaluación ✓'}
      </button>
    </div>
  )
}

// ── Formulario Jefe ────────────────────────────────────────────────────────
function FormJefe({ evaluado, onSubmit, saving }) {
  const [ra, setRa] = useState({})
  const [rb, setRb] = useState({})
  const [rc, setRc] = useState({})
  const [tienePersonal, setTienePersonal] = useState(true)
  const [comentarios, setComentarios] = useState({ fortalezas: '', mejoras: '', recomendaciones: '' })

  const scoreA = avg(ra), scoreB = avg(rb), scoreC = tienePersonal ? avg(rc) : 0
  const bases = [scoreA, scoreB, ...(tienePersonal ? [scoreC] : [])].filter(s => s > 0)
  const prom = bases.length ? bases.reduce((a, b) => a + b, 0) / bases.length : 0

  function handleSubmit() {
    const min = tienePersonal ? 13 : 10
    if (Object.keys(ra).length < 5 || Object.keys(rb).length < 5 || (tienePersonal && Object.keys(rc).length < 3)) {
      alert('Por favor califica todos los criterios.')
      return
    }
    onSubmit({ ra, rb, rc, tienePersonal, comentarios, puntaje_final: parseFloat(prom.toFixed(2)) })
  }

  return (
    <div>
      <div className="alert alert-info">
        Evalúa el desempeño de <strong>{evaluado?.nombre}</strong> basándote en comportamientos observados directamente. Sé objetivo y específico.
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ background: 'var(--cyan-dark)' }}>
          <h2>A. Competencias Organizacionales (40%)</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_JEFE_A.map((c, i) => (
            <RatingRow key={i} num={i + 1} nombre={c.nombre} detalle={c.detalle}
              value={ra[i + 1]} onChange={v => setRa({ ...ra, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--cyan-dark)' }}>
          <h2>B. Competencias Técnicas y de Gestión (35%)</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_JEFE_B.map((c, i) => (
            <RatingRow key={i} num={i + 6} nombre={c.nombre} detalle={c.detalle}
              value={rb[i + 1]} onChange={v => setRb({ ...rb, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--cyan-dark)' }}>
          <h2>C. Liderazgo y Gestión de Personas (25%)</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '10px 14px', background: '#fff8e8', borderRadius: 8, border: '1.5px dashed var(--gold)' }}>
            <input type="checkbox" id="tienePersonal" checked={tienePersonal}
              onChange={e => setTienePersonal(e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
            <label htmlFor="tienePersonal" style={{ cursor: 'pointer', fontSize: 13 }}>
              Este colaborador <strong>tiene personal a cargo</strong> — evaluar sección C
            </label>
          </div>
          {tienePersonal && (
            <div style={{ padding: '0 0 8px' }}>
              {COMP_JEFE_C.map((c, i) => (
                <RatingRow key={i} num={i + 11} nombre={c.nombre} detalle={c.detalle}
                  value={rc[i + 1]} onChange={v => setRc({ ...rc, [i + 1]: v })} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--cyan-dark)' }}>
          <h2>Comentarios del Evaluador</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['fortalezas', 'Principales fortalezas observadas en el período:'],
              ['mejoras', 'Oportunidades de mejora más importantes:'],
              ['recomendaciones', 'Recomendaciones para el plan de desarrollo:'],
            ].map(([key, label]) => (
              <div className="form-field" key={key}>
                <label>{label}</label>
                <textarea value={comentarios[key]} onChange={e => setComentarios({ ...comentarios, [key]: e.target.value })} placeholder="Escribe tus comentarios…" />
              </div>
            ))}
          </div>
        </div>
        <ScoreBar scores={{ a: scoreA, b: scoreB, ...(tienePersonal ? { c: scoreC } : {}) }} label="Puntaje Evaluación Jefe" />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
        style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, marginTop: 8 }}>
        {saving ? 'Guardando…' : 'Enviar evaluación ✓'}
      </button>
    </div>
  )
}

// ── Formulario Pares ───────────────────────────────────────────────────────
function FormPares({ evaluado, onSubmit, saving }) {
  const [ra, setRa] = useState({})
  const [rb, setRb] = useState({})
  const [reflexion, setReflexion] = useState({ fortaleza: '', mejora: '' })

  const scoreA = avg(ra), scoreB = avg(rb)
  const bases = [scoreA, scoreB].filter(s => s > 0)
  const prom = bases.length ? bases.reduce((a, b) => a + b, 0) / bases.length : 0

  function handleSubmit() {
    if (Object.keys(ra).length < 5 || Object.keys(rb).length < 5) {
      alert('Por favor califica todos los criterios.')
      return
    }
    onSubmit({ ra, rb, reflexion, puntaje_final: parseFloat(prom.toFixed(2)) })
  }

  return (
    <div>
      <div className="alert alert-info">
        🔒 Esta evaluación es <strong>anónima y confidencial</strong>. Solo Talento Humano verá los resultados individuales. Evalúa con honestidad.
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header" style={{ background: 'var(--navy)' }}>
          <h2>A. Trabajo en Equipo y Colaboración (50%)</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_PARES_A.map((c, i) => (
            <RatingRow key={i} num={i + 1} nombre={c.nombre} detalle={c.detalle}
              value={ra[i + 1]} onChange={v => setRa({ ...ra, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--navy)' }}>
          <h2>B. Desempeño Observable Día a Día (50%)</h2>
        </div>
        <div className="card-body" style={{ padding: '8px 24px' }}>
          {COMP_PARES_B.map((c, i) => (
            <RatingRow key={i} num={i + 6} nombre={c.nombre} detalle={c.detalle}
              value={rb[i + 1]} onChange={v => setRb({ ...rb, [i + 1]: v })} />
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ background: 'var(--navy)' }}>
          <h2>Retroalimentación Abierta (Anónima)</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-field">
              <label>¿Qué valoras más del trabajo de este compañero?</label>
              <textarea value={reflexion.fortaleza} onChange={e => setReflexion({ ...reflexion, fortaleza: e.target.value })} placeholder="Menciona las fortalezas o contribuciones que más valoras…" />
            </div>
            <div className="form-field">
              <label>¿Qué aspecto le recomendarías mejorar?</label>
              <textarea value={reflexion.mejora} onChange={e => setReflexion({ ...reflexion, mejora: e.target.value })} placeholder="Sé constructivo y específico…" />
            </div>
          </div>
        </div>
        <ScoreBar scores={{ a: scoreA, b: scoreB }} label="Puntaje Evaluación de Pares" />
      </div>

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
        style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, marginTop: 8 }}>
        {saving ? 'Guardando…' : 'Enviar evaluación ✓'}
      </button>
    </div>
  )
}

// ── Formulario KPIs ────────────────────────────────────────────────────────
function FormKPI({ evaluado, onSubmit, saving }) {
  const NUM = 5
  const emptyKPI = { nombre: '', formula: '', meta: '', fuente: '', peso: '', base: '', periodo: '' }
  const [kpis, setKpis] = useState(Array(NUM).fill(null).map(() => ({ ...emptyKPI })))
  const [fase, setFase] = useState('fase1')
  const [resultados, setResultados] = useState(Array(NUM).fill(null).map(() => ({ real: '', pct: '' })))
  const [comentario, setComentario] = useState('')

  const totalPeso = kpis.reduce((s, k) => s + (parseFloat(k.peso) || 0), 0)

  function calificacion(pct) {
    const p = parseFloat(pct)
    if (isNaN(p)) return null
    if (p >= 110) return 5; if (p >= 100) return 4
    if (p >= 85) return 3; if (p >= 70) return 2; return 1
  }

  function puntajeFinal() {
    let sum = 0
    resultados.forEach((r, i) => {
      const cal = calificacion(r.pct)
      const peso = parseFloat(kpis[i].peso) || 0
      if (cal && peso) sum += cal * peso / 100
    })
    return sum
  }

  function handleSubmit() {
    if (fase === 'fase1') {
      if (Math.abs(totalPeso - 100) > 0.01) {
        alert('Los pesos deben sumar exactamente 100%.')
        return
      }
      const filled = kpis.filter(k => k.nombre && k.meta && k.peso)
      if (filled.length === 0) {
        alert('Completa al menos un KPI con nombre, meta y peso.')
        return
      }
    }
    onSubmit({ kpis, resultados, comentario, fase, puntaje_final: parseFloat(puntajeFinal().toFixed(2)) })
  }

  const calColors = { 1: '#c0392b', 2: '#e67e22', 3: '#2471a3', 4: '#27ae60', 5: '#145a32' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[['fase1', '📝 Fase 1: Acuerdo de metas'], ['fase2', '📊 Fase 2: Evaluación de resultados']].map(([f, lbl]) => (
          <button key={f} type="button" onClick={() => setFase(f)}
            className={`btn ${fase === f ? 'btn-navy' : 'btn-ghost'}`}>
            {lbl}
          </button>
        ))}
      </div>

      {fase === 'fase1' && (
        <>
          <div className="alert alert-info">
            <strong>Fase 1 — Inicio del período:</strong> Define entre 3 y 5 KPIs. Los pesos deben sumar 100%.
            <span style={{ marginLeft: 12, fontWeight: 700, color: Math.abs(totalPeso - 100) < 0.01 ? 'var(--green)' : 'var(--red)' }}>
              Total: {totalPeso}%
            </span>
          </div>
          {kpis.map((k, i) => (
            <div className="card" key={i} style={{ marginBottom: 16 }}>
              <div className="card-header" style={{ background: 'var(--cyan-dark)' }}>
                <h2>KPI {i + 1}</h2>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-field full">
                    <label>Nombre del KPI</label>
                    <input placeholder="Ej: Tiempo promedio de reparación de contenedores"
                      value={k.nombre} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], nombre: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field full">
                    <label>Fórmula de cálculo</label>
                    <input placeholder="Ej: Horas totales ÷ N° equipos reparados"
                      value={k.formula} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], formula: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field">
                    <label>Meta acordada</label>
                    <input placeholder="Ej: ≤ 10 horas promedio"
                      value={k.meta} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], meta: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field">
                    <label>Fuente de datos</label>
                    <input placeholder="Ej: Registro de órdenes de trabajo"
                      value={k.fuente} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], fuente: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field">
                    <label>Peso % (todos suman 100)</label>
                    <input type="number" min="0" max="100" placeholder="Ej: 30"
                      value={k.peso} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], peso: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field">
                    <label>Línea base (valor actual)</label>
                    <input placeholder="Ej: 12 horas promedio 2024"
                      value={k.base} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], base: e.target.value }; setKpis(n) }} />
                  </div>
                  <div className="form-field">
                    <label>Período de medición</label>
                    <select value={k.periodo} onChange={e => { const n = [...kpis]; n[i] = { ...n[i], periodo: e.target.value }; setKpis(n) }}>
                      <option value="">Seleccionar…</option>
                      <option>Trimestral</option><option>Semestral</option><option>Anual</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {fase === 'fase2' && (
        <>
          <div className="alert alert-info">
            <strong>Fase 2 — Cierre del período:</strong> Ingresa el resultado real y el % de cumplimiento. La calificación se asigna automáticamente.
          </div>
          {kpis.map((k, i) => {
            const cal = calificacion(resultados[i].pct)
            const peso = parseFloat(k.peso) || 0
            const ponderado = cal && peso ? (cal * peso / 100).toFixed(3) : '—'
            return (
              <div className="card" key={i} style={{ marginBottom: 16 }}>
                <div className="card-header" style={{ background: '#1a3d6b' }}>
                  <h2>KPI {i + 1}{k.nombre ? `: ${k.nombre}` : ''}</h2>
                </div>
                <div className="card-body">
                  <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--gray)' }}>
                    <strong>Meta:</strong> {k.meta || '—'} &nbsp;·&nbsp; <strong>Peso:</strong> {k.peso || '—'}%
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Resultado real obtenido</label>
                      <input placeholder="Ej: 9.2 horas promedio"
                        value={resultados[i].real}
                        onChange={e => { const n = [...resultados]; n[i] = { ...n[i], real: e.target.value }; setResultados(n) }} />
                    </div>
                    <div className="form-field">
                      <label>% de Cumplimiento de la meta</label>
                      <input type="number" placeholder="Ej: 108"
                        value={resultados[i].pct}
                        onChange={e => { const n = [...resultados]; n[i] = { ...n[i], pct: e.target.value }; setResultados(n) }} />
                    </div>
                  </div>
                  {cal && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14, padding: '10px 14px', background: 'var(--cream)', borderRadius: 8 }}>
                      <div className={`score-badge sb-${cal}`}>{cal}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>
                          {['Insatisfactorio', 'Por debajo', 'Cumple', 'Por encima', 'Excepcional'][cal - 1]}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--gray)' }}>Ponderado: {ponderado}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <div className="card">
            <div className="card-header" style={{ background: '#1a3d6b' }}>
              <h2>Resultado Final KPIs</h2>
            </div>
            <div className="card-body">
              <div className="form-field">
                <label>Comentarios sobre los resultados (contexto, factores externos, etc.)</label>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Factores que facilitaron o dificultaron el logro de las metas…" />
              </div>
            </div>
            <div className="total-bar">
              <div className="lbl">Puntaje Final KPIs</div>
              <div style={{ textAlign: 'right' }}>
                <div className="val">{puntajeFinal().toFixed(2)} / 5.0</div>
              </div>
            </div>
          </div>
        </>
      )}

      <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}
        style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14, marginTop: 8 }}>
        {saving ? 'Guardando…' : `Guardar ${fase === 'fase1' ? 'acuerdo de metas' : 'resultados KPIs'} ✓`}
      </button>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────
export default function Evaluar() {
  const router = useRouter()
  const { evaluado_id, evaluador_nombre, tipo, ciclo_id } = router.query
  const [evaluado, setEvaluado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [savedScore, setSavedScore] = useState(null)

  const tipoLabels = {
    autoevaluacion: 'Autoevaluación',
    jefe: 'Evaluación de Jefe Inmediato',
    par: 'Evaluación de Pares',
    kpi: 'Acuerdo / Evaluación de KPIs'
  }

  useEffect(() => {
    if (!evaluado_id) return
    supabase.from('colaboradores').select('*').eq('id', evaluado_id).single()
      .then(({ data }) => { setEvaluado(data); setLoading(false) })
  }, [evaluado_id])

  async function handleSubmit(datos) {
    setSaving(true)
    const { error } = await supabase.from('evaluaciones').insert({
      ciclo_id,
      evaluado_id,
      evaluador_nombre,
      tipo,
      puntaje_final: datos.puntaje_final,
      datos,
      completada: true
    })
    setSaving(false)
    if (error) { alert('Error al guardar: ' + error.message); return }
    setSavedScore(datos.puntaje_final)
    setDone(true)
  }

  if (!router.isReady || loading) return (
    <><Header /><div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}><p style={{ color: 'var(--gray)' }}>Cargando…</p></div></>
  )

  if (done) {
    function getCategoria(s) {
      if (s >= 4.5) return { label: 'Excepcional', emoji: '⭐' }
      if (s >= 3.5) return { label: 'Alto Desempeño', emoji: '🏆' }
      if (s >= 2.5) return { label: 'Satisfactorio', emoji: '✅' }
      if (s >= 1.5) return { label: 'En Mejora', emoji: '📈' }
      return { label: 'Crítico', emoji: '⚠️' }
    }
    const cat = savedScore ? getCategoria(savedScore) : null
    return (
      <><Header />
      <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 24, color: 'var(--navy)', marginBottom: 8 }}>
          ¡Evaluación enviada con éxito!
        </div>
        {savedScore > 0 && cat && (
          <div style={{ background: 'var(--cyan)', color: 'white', borderRadius: 12, padding: '16px 28px', display: 'inline-block', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 800 }}>{savedScore.toFixed(2)} / 5.0</div>
            <div style={{ fontSize: 14, opacity: .85 }}>{cat.emoji} {cat.label}</div>
          </div>
        )}
        <p style={{ color: 'var(--gray)', marginBottom: 28, maxWidth: 440, margin: '0 auto 28px' }}>
          Gracias por completar la {tipoLabels[tipo]} de <strong>{evaluado?.nombre}</strong>. Talento Humano procesará los resultados.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => router.push('/')}>← Hacer otra evaluación</button>
          <button className="btn btn-navy" onClick={() => router.push('/admin')}>Ver panel TH</button>
        </div>
      </div></>
    )
  }

  return (
    <><Header />
    <div className="page-wrap">
      {/* Info header */}
      <div style={{ background: 'var(--navy)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, color: 'white' }}>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
          {tipoLabels[tipo]}
        </div>
        <div style={{ display: 'flex', gap: 24, fontSize: 13, flexWrap: 'wrap' }}>
          <span>👤 <strong>Evaluado:</strong> {evaluado?.nombre} — {evaluado?.cargo}</span>
          <span>✍️ <strong>Evaluador:</strong> {evaluador_nombre}</span>
          <span>📍 <strong>Sede:</strong> {evaluado?.sede}</span>
        </div>
      </div>

      {tipo === 'autoevaluacion' && <FormAutoeval evaluado={evaluado} onSubmit={handleSubmit} saving={saving} />}
      {tipo === 'jefe' && <FormJefe evaluado={evaluado} onSubmit={handleSubmit} saving={saving} />}
      {tipo === 'par' && <FormPares evaluado={evaluado} onSubmit={handleSubmit} saving={saving} />}
      {tipo === 'kpi' && <FormKPI evaluado={evaluado} onSubmit={handleSubmit} saving={saving} />}
    </div></>
  )
}
