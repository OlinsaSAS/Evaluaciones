import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const PONDERACIONES = {
  Operativo:      { autoevaluacion: 10, jefe: 50, par: 20, kpi: 20 },
  Administrativo: { autoevaluacion: 15, jefe: 45, par: 20, kpi: 20 },
  Gerencial:      { autoevaluacion: 15, jefe: 35, par: 20, kpi: 30 },
}

function getCategoria(s) {
  if (!s) return { label: 'Sin datos', emoji: '—', color: '#aaa', bg: '#f5f5f5', accion: '—' }
  const n = parseFloat(s)
  if (n >= 4.5) return { label: 'Excepcional', emoji: '⭐', color: '#145a32', bg: '#d5f5e3', accion: 'Reconocimiento formal + Plan de carrera acelerado' }
  if (n >= 3.5) return { label: 'Alto Desempeño', emoji: '🏆', color: '#0077aa', bg: '#e0f4fd', accion: 'Reconocimiento + Retos de mayor complejidad' }
  if (n >= 2.5) return { label: 'Satisfactorio', emoji: '✅', color: '#1a5a8a', bg: '#eaf2fb', accion: 'Formación en áreas de oportunidad + Seguimiento semestral' }
  if (n >= 1.5) return { label: 'En Mejora', emoji: '📈', color: '#7a5a10', bg: '#fff8e8', accion: 'Plan de mejora 90 días + Seguimiento mensual TH' }
  return { label: 'Crítico', emoji: '⚠️', color: '#7a1a1a', bg: '#fde8e8', accion: 'Intervención urgente Talento Humano' }
}

function calcConsolidado(evals, nivel) {
  const pond = PONDERACIONES[nivel] || PONDERACIONES.Operativo
  let total = 0, pesoUsado = 0
  ;['autoevaluacion', 'jefe', 'par', 'kpi'].forEach(t => {
    const ev = evals.filter(e => e.tipo === t && e.completada && e.puntaje_final)
    if (!ev.length) return
    const prom = ev.reduce((s, e) => s + e.puntaje_final, 0) / ev.length
    total += prom * (pond[t] / 100)
    pesoUsado += pond[t]
  })
  return pesoUsado > 0 ? parseFloat((total / pesoUsado * 100).toFixed(2)) : null
}

export default function Informe() {
  const router = useRouter()
  const { colaborador_id, ciclo_id } = router.query
  const [data, setData] = useState(null)
  const [colaboradores, setColaboradores] = useState([])
  const [ciclos, setCiclos] = useState([])
  const [selColab, setSelColab] = useState('')
  const [selCiclo, setSelCiclo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: cols }, { data: cics }] = await Promise.all([
        supabase.from('colaboradores').select('*').eq('activo', true).order('nombre'),
        supabase.from('ciclos').select('*').order('created_at', { ascending: false })
      ])
      setColaboradores(cols || [])
      setCiclos(cics || [])
      if (cics?.length) setSelCiclo(cics[0].id)
      if (colaborador_id && ciclo_id) {
        setSelColab(colaborador_id)
        setSelCiclo(ciclo_id)
        loadInforme(colaborador_id, ciclo_id, cols, cics)
      }
    }
    load()
  }, [colaborador_id, ciclo_id])

  async function loadInforme(cid, cicid, cols, cics) {
    setLoading(true)
    const colab = (cols || colaboradores).find(c => c.id === cid)
    const ciclo = (cics || ciclos).find(c => c.id === cicid)
    const { data: evals } = await supabase.from('evaluaciones')
      .select('*')
      .eq('evaluado_id', cid)
      .eq('ciclo_id', cicid)
      .eq('completada', true)
      .order('created_at', { ascending: false })

    if (!colab) { setLoading(false); return }

    const pond = PONDERACIONES[colab.nivel] || PONDERACIONES.Operativo
    const tiposInfo = [
      { tipo: 'autoevaluacion', label: 'Autoevaluación', color: '#00AEEF', icon: '👤' },
      { tipo: 'jefe', label: 'Evaluación Jefe', color: '#0077cc', icon: '👔' },
      { tipo: 'par', label: 'Evaluación de Pares', color: '#1a2533', icon: '🤝' },
      { tipo: 'kpi', label: 'Resultados KPIs', color: '#1a8a5a', icon: '📊' },
    ]

    const instrumentos = tiposInfo.map(t => {
      const evs = (evals || []).filter(e => e.tipo === t.tipo)
      const prom = evs.length ? evs.reduce((s, e) => s + e.puntaje_final, 0) / evs.length : null
      const ponderado = prom ? parseFloat((prom * pond[t.tipo] / 100).toFixed(3)) : null
      return { ...t, evals: evs, prom: prom ? parseFloat(prom.toFixed(2)) : null, peso: pond[t.tipo], ponderado }
    })

    const consolidado = calcConsolidado(evals || [], colab.nivel)
    const autoEval = (evals || []).find(e => e.tipo === 'autoevaluacion')
    const jefeEval = (evals || []).find(e => e.tipo === 'jefe')
    const kpiEval  = (evals || []).find(e => e.tipo === 'kpi')

    setData({ colab, ciclo, instrumentos, consolidado, autoEval, jefeEval, kpiEval, evals: evals || [] })
    setLoading(false)
  }

  function handleGenerar() {
    if (!selColab || !selCiclo) return
    loadInforme(selColab, selCiclo, colaboradores, ciclos)
  }

  const NAVY = '#1a2533'
  const CYAN = '#00AEEF'

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #f4f7fb; color: #1a2533; }
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
          .informe-wrap { max-width: 100%; padding: 0; margin: 0; }
          .card-print { box-shadow: none !important; border: 1px solid #ddd !important; }
        }
      `}</style>

      {/* BARRA SUPERIOR - no se imprime */}
      <div className="no-print" style={{ background: NAVY, padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `3px solid ${CYAN}` }}>
        <img src="/logo.jpeg" alt="OLINSA" style={{ height: 40, objectFit: 'contain' }} />
        <div style={{ color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>Informe de Evaluación</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <select value={selCiclo} onChange={e => setSelCiclo(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', fontFamily: 'DM Sans', fontSize: 13 }}>
            {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={selColab} onChange={e => setSelColab(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: 'none', fontFamily: 'DM Sans', fontSize: 13, minWidth: 220 }}>
            <option value="">Seleccionar colaborador…</option>
            {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.cargo}</option>)}
          </select>
          <button onClick={handleGenerar} disabled={!selColab || !selCiclo || loading}
            style={{ background: CYAN, color: 'white', border: 'none', borderRadius: 8, padding: '9px 20px', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase', opacity: (!selColab || loading) ? .5 : 1 }}>
            {loading ? 'Cargando…' : 'Generar informe'}
          </button>
          {data && (
            <button onClick={() => window.print()}
              style={{ background: '#f5a623', color: NAVY, border: 'none', borderRadius: 8, padding: '9px 20px', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>
              🖨 Imprimir / PDF
            </button>
          )}
          <a href="/admin" style={{ color: 'rgba(255,255,255,.55)', fontSize: 12, textDecoration: 'none', marginLeft: 4 }}>← Panel TH</a>
        </div>
      </div>

      {/* ESTADO VACÍO */}
      {!data && !loading && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#8a9bb0' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📋</div>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 22, color: NAVY, marginBottom: 8 }}>
            Selecciona un colaborador y un ciclo
          </div>
          <p style={{ fontSize: 14 }}>El informe completo se generará listo para imprimir o guardar como PDF.</p>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: 80, color: '#8a9bb0', fontSize: 14 }}>Cargando datos…</div>
      )}

      {/* INFORME */}
      {data && (
        <div className="informe-wrap" style={{ maxWidth: 860, margin: '30px auto', padding: '0 20px 60px' }}>

          {/* ENCABEZADO */}
          <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: NAVY, padding: '24px 32px', borderBottom: `4px solid ${CYAN}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <img src="/logo.jpeg" alt="OLINSA" style={{ height: 46, objectFit: 'contain' }} />
                  <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>
                    Opción Logística Integral S.A.S
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: CYAN, fontFamily: 'Syne', fontWeight: 800, fontSize: 15, letterSpacing: 1 }}>
                    INFORME DE EVALUACIÓN DE DESEMPEÑO
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>
                    {data.ciclo?.nombre} · {data.ciclo?.periodo}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, marginTop: 2 }}>
                    Generado: {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* DATOS COLABORADOR + RESULTADO */}
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #e8eef5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: NAVY, marginBottom: 10 }}>
                    {data.colab.nombre}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 40px', fontSize: 13 }}>
                    {[['Cargo', data.colab.cargo], ['Área', data.colab.area || '—'], ['Sede', data.colab.sede], ['Nivel', data.colab.nivel]].map(([k, v]) => (
                      <div key={k}>
                        <span style={{ color: '#8a9bb0', fontWeight: 600, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>{k}: </span>
                        <span style={{ fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {data.consolidado && (() => {
                  const cat = getCategoria(data.consolidado)
                  return (
                    <div style={{ textAlign: 'center', background: cat.bg, borderRadius: 14, padding: '18px 28px', border: `2px solid ${cat.color}`, minWidth: 140 }}>
                      <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 40, color: cat.color, lineHeight: 1 }}>{data.consolidado}</div>
                      <div style={{ fontSize: 11, color: cat.color, opacity: .65, marginBottom: 4 }}>/ 5.0</div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: cat.color }}>{cat.emoji} {cat.label}</div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* BARRA DE PROGRESO */}
            {data.consolidado && (
              <div style={{ padding: '14px 32px', background: '#f4f7fb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 11, color: '#8a9bb0', fontWeight: 600, width: 80 }}>Desempeño</div>
                  <div style={{ flex: 1, background: '#dde6f0', borderRadius: 99, height: 10 }}>
                    <div style={{ width: `${(data.consolidado / 5) * 100}%`, background: CYAN, height: '100%', borderRadius: 99 }} />
                  </div>
                  <div style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 800, color: CYAN, width: 44, textAlign: 'right' }}>
                    {Math.round((data.consolidado / 5) * 100)}%
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, paddingLeft: 92, paddingRight: 48 }}>
                  {[['1','Crítico','#e53e3e'],['2','En Mejora','#dd7a00'],['3','Satisfactorio','#0077cc'],['4','Alto','#1a8a5a'],['5','Excepcional','#00AEEF']].map(([n,l,c]) => (
                    <div key={n} style={{ textAlign: 'center', fontSize: 9, color: c }}>
                      <div style={{ fontWeight: 800 }}>{n}</div><div>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TABLA INSTRUMENTOS */}
          <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: NAVY, padding: '12px 24px', borderBottom: `3px solid ${CYAN}` }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>
                📊 Resultados por Instrumento de Evaluación
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f4f7fb' }}>
                  {['Instrumento', 'N° Eval.', 'Puntaje Promedio', `Ponderación (${data.colab.nivel})`, 'Puntaje Ponderado'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'Syne', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#8a9bb0', borderBottom: '1px solid #e8eef5' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.instrumentos.map((inst, i) => (
                  <tr key={inst.tipo} style={{ borderBottom: '1px solid #e8eef5', background: i % 2 === 0 ? 'white' : '#fafcfe' }}>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: inst.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{inst.icon}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{inst.label}</div>
                          <div style={{ fontSize: 11, color: '#8a9bb0' }}>Formato {['F1','F2','F3','F4'][i]}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <span style={{ background: inst.evals.length > 0 ? '#e0f4fd' : '#f5f5f5', color: inst.evals.length > 0 ? '#005a80' : '#aaa', borderRadius: 20, padding: '3px 10px', fontWeight: 700, fontSize: 12 }}>
                        {inst.evals.length}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {inst.prom ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: getCategoria(inst.prom).color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Syne', fontWeight: 800, fontSize: 13 }}>{inst.prom}</div>
                          <div style={{ fontSize: 11, color: '#8a9bb0' }}>{getCategoria(inst.prom).label}</div>
                        </div>
                      ) : <span style={{ color: '#ccc', fontSize: 12 }}>Sin datos</span>}
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, color: NAVY }}>{inst.peso}%</span>
                    </td>
                    <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                      {inst.ponderado
                        ? <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: inst.color }}>{inst.ponderado}</span>
                        : <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: NAVY }}>
                  <td colSpan={4} style={{ padding: '14px 16px', color: 'white', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', textAlign: 'right' }}>
                    PUNTAJE FINAL CONSOLIDADO
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: CYAN }}>{data.consolidado || '—'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* INTERPRETACIÓN */}
          {data.consolidado && (() => {
            const cat = getCategoria(data.consolidado)
            const descripciones = {
              'Excepcional': 'Supera consistentemente las expectativas. Es un referente para el equipo y demuestra un nivel de desempeño extraordinario en todos los frentes evaluados.',
              'Alto Desempeño': 'Cumple y frecuentemente supera los requisitos del cargo. Demuestra iniciativa, compromiso y alto nivel de ejecución.',
              'Satisfactorio': 'Cumple los requisitos del cargo de forma regular y estable. Desempeño confiable con oportunidades de crecimiento identificadas.',
              'En Mejora': 'Cumple parcialmente los requisitos del cargo. Requiere acompañamiento activo y un plan de mejora estructurado.',
              'Crítico': 'No cumple los requisitos mínimos del cargo. Se requiere intervención urgente del área de Talento Humano.',
            }
            return (
              <div className="card-print" style={{ background: cat.bg, borderRadius: 12, border: `2px solid ${cat.color}`, padding: '20px 28px', marginBottom: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ fontSize: 38 }}>{cat.emoji}</div>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 17, color: cat.color, marginBottom: 6 }}>
                      {cat.label} — {data.consolidado} / 5.0
                    </div>
                    <div style={{ fontSize: 13, color: cat.color, opacity: .85, marginBottom: 10, lineHeight: 1.6 }}>
                      {descripciones[cat.label]}
                    </div>
                    <div style={{ background: 'rgba(0,0,0,.07)', borderRadius: 8, padding: '7px 14px', display: 'inline-block' }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: cat.color }}>Acción recomendada: </span>
                      <span style={{ fontSize: 12, color: cat.color }}>{cat.accion}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* REFLEXIÓN COLABORADOR */}
          {data.autoEval?.datos?.reflexion && (
            <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ background: CYAN, padding: '12px 24px' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>👤 Reflexión del Colaborador</div>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[['Mayor fortaleza', data.autoEval.datos.reflexion.fortaleza], ['Apoyo o formación requerida', data.autoEval.datos.reflexion.apoyo], ['Compromiso personal', data.autoEval.datos.reflexion.compromiso]]
                  .filter(([, v]) => v).map(([titulo, texto]) => (
                  <div key={titulo} style={{ borderLeft: `4px solid ${CYAN}`, paddingLeft: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{titulo}</div>
                    <div style={{ fontSize: 14, color: NAVY, lineHeight: 1.6 }}>{texto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RETROALIMENTACIÓN JEFE */}
          {data.jefeEval?.datos?.comentarios && (
            <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ background: '#0077cc', padding: '12px 24px' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>👔 Retroalimentación del Jefe Inmediato</div>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[['Fortalezas observadas', data.jefeEval.datos.comentarios.fortalezas], ['Oportunidades de mejora', data.jefeEval.datos.comentarios.mejoras], ['Recomendaciones para el desarrollo', data.jefeEval.datos.comentarios.recomendaciones]]
                  .filter(([, v]) => v).map(([titulo, texto]) => (
                  <div key={titulo} style={{ borderLeft: '4px solid #0077cc', paddingLeft: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#8a9bb0', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{titulo}</div>
                    <div style={{ fontSize: 14, color: NAVY, lineHeight: 1.6 }}>{texto}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          {data.kpiEval?.datos?.kpis && (
            <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
              <div style={{ background: '#1a8a5a', padding: '12px 24px' }}>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>📊 Indicadores de Gestión (KPIs)</div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f4f7fb' }}>
                    {['KPI', 'Meta', 'Resultado', '% Cumpl.', 'Cal.', 'Peso'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontFamily: 'Syne', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#8a9bb0', borderBottom: '1px solid #e8eef5' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.kpiEval.datos.kpis.map((k, i) => {
                    if (!k.nombre) return null
                    const res = data.kpiEval.datos.resultados?.[i]
                    const pct = res?.pct ? parseFloat(res.pct) : null
                    const cal = pct ? (pct >= 110 ? 5 : pct >= 100 ? 4 : pct >= 85 ? 3 : pct >= 70 ? 2 : 1) : null
                    const calColors = { 1: '#e53e3e', 2: '#dd7a00', 3: '#0077cc', 4: '#1a8a5a', 5: '#00AEEF' }
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #e8eef5' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 600 }}>{k.nombre}</td>
                        <td style={{ padding: '9px 12px', color: '#8a9bb0' }}>{k.meta || '—'}</td>
                        <td style={{ padding: '9px 12px' }}>{res?.real || '—'}</td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          {pct ? <span style={{ fontWeight: 700, color: pct >= 85 ? '#1a8a5a' : '#dd7a00' }}>{pct}%</span> : '—'}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                          {cal ? <span style={{ background: calColors[cal], color: 'white', borderRadius: '50%', width: 26, height: 26, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 12 }}>{cal}</span> : '—'}
                        </td>
                        <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 700 }}>{k.peso ? `${k.peso}%` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {data.kpiEval.datos.comentario && (
                <div style={{ padding: '12px 16px', borderTop: '1px solid #e8eef5', fontSize: 13, color: '#555', background: '#fafcfe' }}>
                  <span style={{ fontWeight: 700, color: '#8a9bb0', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Comentarios: </span>
                  {data.kpiEval.datos.comentario}
                </div>
              )}
            </div>
          )}

          {/* PLAN DE DESARROLLO */}
          <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: '#0077cc', padding: '12px 24px' }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>📈 Plan de Desarrollo Individual</div>
            </div>
            <div style={{ padding: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f4f7fb' }}>
                    {['Área de Mejora / Objetivo', 'Acción Concreta', 'Apoyo Requerido', 'Fecha Límite'].map(h => (
                      <th key={h} style={{ padding: '9px 12px', textAlign: 'left', fontFamily: 'Syne', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#8a9bb0', borderBottom: '1px solid #e8eef5' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3].map(i => (
                    <tr key={i} style={{ borderBottom: '1px solid #e8eef5', height: 46 }}>
                      <td style={{ padding: '10px 12px', color: '#ccc', fontSize: 12, fontStyle: 'italic' }}>Por definir en sesión de retroalimentación</td>
                      <td style={{ padding: '10px 12px' }} />
                      <td style={{ padding: '10px 12px' }} />
                      <td style={{ padding: '10px 12px' }} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FIRMAS */}
          <div className="card-print" style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 14px rgba(0,0,0,.08)', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ background: NAVY, padding: '12px 24px', borderBottom: `3px solid ${CYAN}` }}>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', color: 'white' }}>✍️ Firmas de Conformidad</div>
            </div>
            <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 32 }}>
              {['Colaborador', 'Jefe Inmediato', 'Talento Humano'].map(rol => (
                <div key={rol} style={{ textAlign: 'center' }}>
                  <div style={{ borderBottom: `2px solid ${NAVY}`, height: 56, marginBottom: 10 }} />
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 12, color: NAVY }}>{rol}</div>
                  <div style={{ fontSize: 11, color: '#8a9bb0', marginTop: 4 }}>Nombre, firma y fecha</div>
                </div>
              ))}
            </div>
          </div>

          {/* PIE DE PÁGINA */}
          <div style={{ textAlign: 'center', fontSize: 11, color: '#8a9bb0', paddingTop: 12, borderTop: '1px solid #e8eef5' }}>
            🔒 Documento confidencial · OLINSA S.A.S. — Opción Logística Integral · Área de Talento Humano · {new Date().getFullYear()}
          </div>

        </div>
      )}
    </>
  )
}
