import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'

export default function Home() {
  const router = useRouter()
  const [colaboradores, setColaboradores] = useState([])
  const [ciclos, setCiclos] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    evaluado_id: '',
    evaluador_nombre: '',
    tipo: '',
    ciclo_id: ''
  })

  useEffect(() => {
    async function load() {
      const [{ data: cols }, { data: cics }] = await Promise.all([
        supabase.from('colaboradores').select('*').eq('activo', true).order('nombre'),
        supabase.from('ciclos').select('*').eq('activo', true).order('created_at', { ascending: false })
      ])
      setColaboradores(cols || [])
      setCiclos(cics || [])
      if (cics && cics.length > 0) setForm(f => ({ ...f, ciclo_id: cics[0].id }))
      setLoading(false)
    }
    load()
  }, [])

  const tiposEval = [
    { value: 'autoevaluacion', label: 'Autoevaluación', desc: 'Evalúas tu propio desempeño', color: '#00AEEF', icon: '👤' },
    { value: 'jefe', label: 'Evaluación de Jefe', desc: 'Evalúas a un colaborador a tu cargo', color: '#0077cc', icon: '👔' },
    { value: 'par', label: 'Evaluación de Par', desc: 'Evalúas a un compañero de trabajo', color: '#1a2533', icon: '🤝' },
    { value: 'kpi', label: 'Acuerdo / Evaluación KPIs', desc: 'Registrar o evaluar indicadores de gestión', color: '#00AEEF', icon: '📊' },
  ]

  function handleStart() {
    if (!form.evaluado_id || !form.evaluador_nombre || !form.tipo || !form.ciclo_id) return
    const params = new URLSearchParams(form)
    router.push(`/evaluar?${params.toString()}`)
  }

  if (loading) return (
    <>
      <Header />
      <div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}>
        <p style={{ color: 'var(--gray)' }}>Cargando…</p>
      </div>
    </>
  )

  return (
    <>
      <Header />
      <div className="page-wrap">
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '32px 0 28px' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 28, color: 'var(--navy)', marginBottom: 8 }}>
            Sistema de Evaluación de Desempeño
          </div>
          <p style={{ color: 'var(--gray)', fontSize: 15 }}>
            Período 2026 · OLINSA S.A.S. · Medellín, Barranquilla, Urabá, Santa Marta, Cartagena, Buenaventura
          </p>
        </div>

        {colaboradores.length === 0 ? (
          <div className="alert alert-warn">
            ⚠️ No hay colaboradores registrados aún. Ve al <strong>Panel TH</strong> para agregar colaboradores y crear un ciclo de evaluación primero.
          </div>
        ) : ciclos.length === 0 ? (
          <div className="alert alert-warn">
            ⚠️ No hay un ciclo de evaluación activo. Ve al <strong>Panel TH</strong> para crear uno.
          </div>
        ) : (
          <div className="card">
            <div className="card-header" style={{ background: 'var(--navy)' }}>
              <h2>Iniciar evaluación</h2>
            </div>
            <div className="card-body">
              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                📋 Completa los datos y selecciona el tipo de evaluación que vas a realizar.
              </div>

              {/* Ciclo */}
              <div className="form-field" style={{ marginBottom: 20 }}>
                <label>Ciclo de evaluación</label>
                <select value={form.ciclo_id} onChange={e => setForm({ ...form, ciclo_id: e.target.value })}>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.periodo}</option>)}
                </select>
              </div>

              <div className="form-grid" style={{ marginBottom: 20 }}>
                <div className="form-field">
                  <label>Tu nombre completo (evaluador)</label>
                  <input
                    type="text"
                    placeholder="Ej: Carlos Martínez López"
                    value={form.evaluador_nombre}
                    onChange={e => setForm({ ...form, evaluador_nombre: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Persona a evaluar</label>
                  <select
                    value={form.evaluado_id}
                    onChange={e => setForm({ ...form, evaluado_id: e.target.value })}
                  >
                    <option value="">Seleccionar colaborador…</option>
                    {colaboradores.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} — {c.cargo} ({c.sede})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tipo evaluación */}
              <div className="form-field" style={{ marginBottom: 24 }}>
                <label>Tipo de evaluación</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
                  {tiposEval.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: t.value })}
                      style={{
                        border: `2px solid ${form.tipo === t.value ? t.color : 'var(--border)'}`,
                        borderRadius: 10,
                        padding: '14px 16px',
                        background: form.tipo === t.value ? t.color : 'white',
                        color: form.tipo === t.value ? 'white' : 'var(--navy)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all .18s'
                      }}
                    >
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                      <div style={{ fontSize: 12, opacity: .75, marginTop: 2 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleStart}
                disabled={!form.evaluado_id || !form.evaluador_nombre || !form.tipo || !form.ciclo_id}
                style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 14 }}
              >
                Comenzar evaluación →
              </button>
            </div>
          </div>
        )}

        {/* Escala */}
        <div className="card">
          <div className="card-header" style={{ background: 'var(--cyan)' }}>
            <h2>Escala de calificación</h2>
          </div>
          <div className="card-body" style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                ['1','Insatisfactorio','No cumple los requisitos mínimos.','#c0392b'],
                ['2','Por debajo','Cumple parcialmente. Requiere mejora.','#e67e22'],
                ['3','Cumple','Cumple los requisitos de forma regular.','#2471a3'],
                ['4','Por encima','Cumple y frecuentemente supera.','#27ae60'],
                ['5','Excepcional','Supera consistentemente. Es referente.','#145a32'],
              ].map(([n, lbl, desc, color]) => (
                <div key={n} style={{ flex: '1 1 160px', background: 'var(--cream)', borderRadius: 8, padding: '10px 14px', borderLeft: `4px solid ${color}` }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color }}>{n}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3 }}>{lbl}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray)' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
