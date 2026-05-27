import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Admin() {
  const [status, setStatus] = useState('Conectando...')
  const [ciclos, setCiclos] = useState([])

  useEffect(() => {
    async function test() {
      try {
        const { data, error } = await supabase.from('ciclos').select('*')
        if (error) {
          setStatus('Error: ' + error.message)
        } else {
          setStatus('Conexión exitosa. Ciclos: ' + (data?.length || 0))
          setCiclos(data || [])
        }
      } catch (e) {
        setStatus('Excepción: ' + e.message)
      }
    }
    test()
  }, [])

  return (
    <div style={{ padding: 40, fontFamily: 'Arial' }}>
      <h1>Test de conexión Supabase</h1>
      <p style={{ marginTop: 20, fontSize: 18 }}>{status}</p>
      <ul style={{ marginTop: 20 }}>
        {ciclos.map(c => <li key={c.id}>{c.nombre}</li>)}
      </ul>
    </div>
  )
}
