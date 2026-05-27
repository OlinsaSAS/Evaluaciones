import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { getCategoria } from '../components/ScoreBar'

const PONDERACIONES = {
  Operativo:      { autoevaluacion: 10, jefe: 50, par: 20, kpi: 20 },
  Administrativo: { autoevaluacion: 15, jefe: 45, par: 20, kpi: 20 },
  Gerencial:      { autoevaluacion: 15, jefe: 35, par: 20, kpi: 30 },
}

function calcConsolidado(evals, nivel) {
  const pond = PONDERACIONES[nivel] || PONDERACIONES.Operativo
  const tipos = ['autoevaluacion', 'jefe', 'par', 'kpi']
  let total = 0, pesoUsado = 0
  tipos.forEach(t => {
    const ev = evals.filter(e => e.tipo === t && e.puntaje_final)
    if (ev.length === 0) return
    const promTipo = ev.reduce((s, e) => s + e.puntaje_final, 0) / ev.length
    total += promTipo * (pond[t] / 100)
    pesoUsado += pond[t]
  })
  return pesoUsado > 0 ? (total / pesoUsado * 100).toFixed(2) : null
}

export default function Admin() {
  const [tab, setTab] = useState('dashboard')
  const [colaboradores, setColaboradores] = useState([])
  const [ciclos, setCiclos] = useState([])
  const [evaluaciones, setEvaluaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCiclo, setSelectedCiclo] = useState('')
  const [newColab, setNewColab] = useState({ nombre: '', cargo: '', area: '', sede: 'Medellín', nivel: 'Operativo' })
  const [newCiclo, setNewCiclo] = useState({ nombre: '', periodo: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: cols }, { data: cics }, { data: evals }] = await Promise.all([
      supabase.from('colaboradores').select('*').order('nombre'),
      supabase.from('ciclos').select('*').order('created_at', { ascending: false }),
      supabase.from('evaluaciones').select('*, colaboradores(nombre,cargo,nivel,sede)').order('created_at', { ascending: false }),
    ])
    setColaboradores(cols || [])
    setCiclos(cics || [])
    setEvaluaciones(evals || [])
    if (cics && cics.length > 0) setSelectedCiclo(cics[0].id)
    setLoading(false)
  }

  function showMsg(type, text) {
    setMsg({ type, text })
    setTimeout(() => setMsg({ type: '', text: '' }), 3500)
  }

  async function addColaborador() {
    if (!newColab.nombre || !newColab.cargo) { showMsg('error', 'Nombre y cargo son obligatorios.'); return }
    const { error } = await supabase.from('colaboradores').insert(newColab)
    if (error) { showMsg('error', 'Error: ' + error.message); return }
    showMsg('success', `✅ ${newColab.nombre} agregado correctamente.`)
    setNewColab({ nombre: '', cargo: '', area: '', sede: 'Medellín', nivel: 'Operativo' })
    loadAll()
  }

  async function toggleActivo(id, activo) {
    await supabase.from('colaboradores').update({ activo: !activo }).eq('id', id)
    loadAll()
  }

  async function addCiclo() {
    if (!newCiclo.nombre || !newCiclo.periodo) { showMsg('error', 'Nombre y período son obligatorios.'); return }
    const { error } = await supabase.from('ciclos').insert({ ...newCiclo, activo: true })
    if (error) { showMsg('error', 'Error: ' + error.message); return }
    showMsg('success', '✅ Ciclo creado correctamente.')
    setNewCiclo({ nombre: '', periodo: '' })
    loadAll()
  }

  async function toggleCiclo(id, activo) {
    await supabase.from('ciclos').update({ activo: !activo }).eq('id', id)
    loadAll()
  }

  const evalsCiclo = evaluaciones.filter(e => e.ciclo_id === selectedCiclo)
  const colabsConEval = colaboradores.map(c => {
    const evals = evalsCiclo.filter(e => e.evaluado_id === c.id && e.completada)
    const consolidado = calcConsolidado(evals, c.nivel)
    return { ...c, evals, consolidado }
  })

  const tipoLabels = { autoevaluacion: 'Auto', jefe: 'Jefe', par: 'Par', kpi: 'KPI' }
  const tipoColors = { autoevaluacion: '#00AEEF', jefe: '#0077cc', par: '#1a2533', kpi: '#1a8a5a' }

  function ScoreBadge({ score }) {
    if (!score) return <span style={{ color: 'var(--gray)', fontSize: 12 }}>—</span>
    const s = parseFloat(score)
    const colors = { 5: '#145a32', 4: '#27ae60', 3: '#2471a3', 2: '#e67e22', 1: '#c0392b' }
    const n = s >= 4.5 ? 5 : s >= 3.5 ? 4 : s >= 2.5 ? 3 : s >= 1.5 ? 2 : 1
    return <span style={{ background: colors[n], color: 'white', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'Syne' }}>{s}</span>
  }

  if (loading) return (
    <><Header adminMode /><div className="page-wrap" style={{ textAlign: 'center', paddingTop: 80 }}><p style={{ color: 'var(--gray)' }}>Cargando datos…</p></div></>
  )

  return (
    <>
      <Header adminMode />
      <div className="page-wrap-wide">
        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 22, color: 'var(--navy)', margin: '20px 0 6px' }}>Panel de Talento Humano</div>
        <p style={{ color: 'var(--gray)', marginBottom: 24 }}>Administración de colaboradores, ciclos y resultados de evaluación.</p>

        {msg.text && <div className={`alert alert-${msg.type} mb-4`}>{msg.text}</div>}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '2px solid var(--border)' }}>
          {[['dashboard','📊 Resultados'],['colaboradores','👥 Colaboradores'],['ciclos','🗓 Ciclos'],['detalle','🔍 Detalle'],['informe','📄 Informes']].map(([t, lbl]) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              style={{ padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Syne', fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: tab === t ? 'var(--cyan)' : 'var(--gray)', borderBottom: tab === t ? '3px solid var(--cyan)' : '3px solid transparent', marginBottom: -2 }}>
              {lbl}
            </button>
          ))}
        </div>

        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Ciclo:</label>
              <select value={selectedCiclo} onChange={e => setSelectedCiclo(e.target.value)}
                style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontFamily: 'DM Sans', fontSize: 14 }}>
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre} — {c.periodo}</option>)}
              </select>
              <span style={{ fontSize: 13, color: 'var(--gray)' }}>{evalsCiclo.length} evaluaciones registradas</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
              {[['Colaboradores', colaboradores.filter(c=>c.activo).length,'var(--navy)','👥'],['Evaluaciones', evalsCiclo.length,'var(--cyan)','📝'],['Completadas', evalsCiclo.filter(e=>e.completada).length,'var(--green)','✅'],['Pendientes', Math.max(0, colaboradores.filter(c=>c.activo).length*4-evalsCiclo.length),'var(--gold)','⏳']].map(([lbl,val,color,ico]) => (
                <div key={lbl} style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,.07)', borderLeft: `5px solid ${color}` }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ico}</div>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26, color }}>{val}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--navy)' }}><h2>Resultados consolidados por colaborador</h2></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Colaborador</th><th>Cargo / Nivel</th><th>Sede</th><th style={{textAlign:'center'}}>Auto</th><th style={{textAlign:'center'}}>Jefe</th><th style={{textAlign:'center'}}>Pares</th><th style={{textAlign:'center'}}>KPIs</th><th style={{textAlign:'center'}}>Consolidado</th><th>Categoría</th></tr></thead>
                  <tbody>
                    {colabsConEval.filter(c=>c.activo).map(c => {
                      const cat = c.consolidado ? getCategoria(parseFloat(c.consolidado)) : null
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                          <td><div style={{ fontSize: 13 }}>{c.cargo}</div><span className={`chip chip-${c.nivel==='Operativo'?'op':c.nivel==='Administrativo'?'adm':'ger'}`}>{c.nivel}</span></td>
                          <td style={{ fontSize: 13, color: 'var(--gray)' }}>{c.sede}</td>
                          {['autoevaluacion','jefe','par','kpi'].map(t => {
                            const evs = c.evals.filter(e=>e.tipo===t)
                            const prom = evs.length ? (evs.reduce((s,e)=>s+(e.puntaje_final||0),0)/evs.length).toFixed(2) : null
                            return <td key={t} style={{textAlign:'center'}}>{prom ? <ScoreBadge score={prom} /> : <span className="chip chip-pend">Pendiente</span>}</td>
                          })}
                          <td style={{textAlign:'center'}}>{c.consolidado ? <span style={{fontFamily:'Syne',fontWeight:800,fontSize:16,color:'var(--navy)'}}>{c.consolidado}</span> : <span style={{color:'var(--gray)'}}>—</span>}</td>
                          <td>{cat ? <span>{cat.emoji} {cat.label}</span> : <span style={{color:'var(--gray)',fontSize:12}}>Sin datos</span>}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'colaboradores' && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header" style={{ background: 'var(--cyan)' }}><h2>Agregar colaborador</h2></div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-field"><label>Nombre completo *</label><input placeholder="Ej: María González" value={newColab.nombre} onChange={e=>setNewColab({...newColab,nombre:e.target.value})} /></div>
                  <div className="form-field"><label>Cargo *</label><input placeholder="Ej: Técnico de Mantenimiento" value={newColab.cargo} onChange={e=>setNewColab({...newColab,cargo:e.target.value})} /></div>
                  <div className="form-field"><label>Área</label><input placeholder="Ej: Taller" value={newColab.area} onChange={e=>setNewColab({...newColab,area:e.target.value})} /></div>
                  <div className="form-field"><label>Sede</label><select value={newColab.sede} onChange={e=>setNewColab({...newColab,sede:e.target.value})}>{['Medellín','Barranquilla','Urabá','Santa Marta','Cartagena','Buenaventura'].map(s=><option key={s}>{s}</option>)}</select></div>
                  <div className="form-field"><label>Nivel</label><select value={newColab.nivel} onChange={e=>setNewColab({...newColab,nivel:e.target.value})}>{['Operativo','Administrativo','Gerencial'].map(n=><option key={n}>{n}</option>)}</select></div>
                </div>
                <button className="btn btn-primary mt-4" onClick={addColaborador}>+ Agregar colaborador</button>
              </div>
            </div>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--navy)' }}><h2>{colaboradores.length} colaboradores registrados</h2></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Nombre</th><th>Cargo</th><th>Área</th><th>Sede</th><th>Nivel</th><th style={{textAlign:'center'}}>Estado</th><th style={{textAlign:'center'}}>Acción</th></tr></thead>
                  <tbody>
                    {colaboradores.map(c => (
                      <tr key={c.id}>
                        <td style={{fontWeight:600}}>{c.nombre}</td><td>{c.cargo}</td><td style={{color:'var(--gray)',fontSize:13}}>{c.area}</td><td style={{fontSize:13}}>{c.sede}</td>
                        <td><span className={`chip chip-${c.nivel==='Operativo'?'op':c.nivel==='Administrativo'?'adm':'ger'}`}>{c.nivel}</span></td>
                        <td style={{textAlign:'center'}}><span className={`chip ${c.activo?'chip-ok':'chip-pend'}`}>{c.activo?'Activo':'Inactivo'}</span></td>
                        <td style={{textAlign:'center'}}><button className={`btn btn-sm ${c.activo?'btn-ghost':'btn-primary'}`} onClick={()=>toggleActivo(c.id,c.activo)}>{c.activo?'Desactivar':'Activar'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {tab === 'ciclos' && (
          <div>
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="card-header" style={{ background: 'var(--cyan)' }}><h2>Crear ciclo de evaluación</h2></div>
              <div className="card-body">
                <div className="form-grid">
                  <div className="form-field"><label>Nombre del ciclo *</label><input placeholder="Ej: Evaluación Anual 2026" value={newCiclo.nombre} onChange={e=>setNewCiclo({...newCiclo,nombre:e.target.value})} /></div>
                  <div className="form-field"><label>Período *</label><input placeholder="Ej: Enero – Diciembre 2026" value={newCiclo.periodo} onChange={e=>setNewCiclo({...newCiclo,periodo:e.target.value})} /></div>
                </div>
                <button className="btn btn-primary mt-4" onClick={addCiclo}>+ Crear ciclo</button>
              </div>
            </div>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--navy)' }}><h2>Ciclos registrados</h2></div>
              <table className="data-table">
                <thead><tr><th>Nombre</th><th>Período</th><th>Estado</th><th>Evaluaciones</th><th>Acción</th></tr></thead>
                <tbody>
                  {ciclos.map(c => (
                    <tr key={c.id}>
                      <td style={{fontWeight:600}}>{c.nombre}</td><td>{c.periodo}</td>
                      <td><span className={`chip ${c.activo?'chip-ok':'chip-pend'}`}>{c.activo?'Activo':'Cerrado'}</span></td>
                      <td>{evaluaciones.filter(e=>e.ciclo_id===c.id).length}</td>
                      <td><button className={`btn btn-sm ${c.activo?'btn-ghost':'btn-primary'}`} onClick={()=>toggleCiclo(c.id,c.activo)}>{c.activo?'Cerrar ciclo':'Reabrir'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'informe' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
            <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: 'var(--navy)', marginBottom: 8 }}>Informe Individual Imprimible</div>
            <p style={{ color: 'var(--gray)', marginBottom: 24, maxWidth: 440, margin: '0 auto 24px' }}>Genera el informe completo de un colaborador listo para imprimir o guardar como PDF.</p>
            <a href="/informe" className="btn btn-primary" style={{ fontSize: 14, padding: '12px 28px' }}>Ir al generador de informes →</a>
          </div>
        )}

        {tab === 'detalle' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Ciclo:</label>
              <select value={selectedCiclo} onChange={e=>setSelectedCiclo(e.target.value)}
                style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 14px', fontFamily: 'DM Sans', fontSize: 14 }}>
                {ciclos.map(c=><option key={c.id} value={c.id}>{c.nombre} — {c.periodo}</option>)}
              </select>
            </div>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--navy)' }}><h2>Todas las evaluaciones del ciclo</h2></div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr><th>Evaluado</th><th>Tipo</th><th>Evaluador</th><th>Puntaje</th><th>Fecha</th></tr></thead>
                  <tbody>
                    {evalsCiclo.length === 0 && <tr><td colSpan={5} style={{textAlign:'center',color:'var(--gray)',padding:28}}>No hay evaluaciones en este ciclo aún.</td></tr>}
                    {evalsCiclo.map(e => (
                      <tr key={e.id}>
                        <td style={{fontWeight:600}}>{e.colaboradores?.nombre||'—'}<div style={{fontSize:11,color:'var(--gray)'}}>{e.colaboradores?.cargo}</div></td>
                        <td><span style={{background:tipoColors[e.tipo]||'#ccc',color:'white',borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700}}>{tipoLabels[e.tipo]||e.tipo}</span></td>
                        <td style={{fontSize:13}}>{e.evaluador_nombre}</td>
                        <td>{e.puntaje_final>0?<span style={{fontFamily:'Syne',fontWeight:700}}>{e.puntaje_final?.toFixed(2)}</span>:'—'}</td>
                        <td style={{fontSize:12,color:'var(--gray)'}}>{new Date(e.created_at).toLocaleDateString('es-CO',{day:'2-digit',month:'short',year:'numeric'})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
