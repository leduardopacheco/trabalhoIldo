import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { prontuarioService } from '../services/api'

const inputStyle = { padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }
const btnStyle = { padding: '8px 20px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const tabStyle = (active) => ({
  padding: '8px 20px', border: 'none', borderBottom: active ? '2px solid #0066cc' : '2px solid transparent',
  background: 'none', cursor: 'pointer', fontWeight: active ? 'bold' : 'normal', color: active ? '#0066cc' : '#555'
})

export default function Prontuario() {
  const { id: idPaciente } = useParams()
  const [prontuario, setProntuario] = useState(null)
  const [consultas, setConsultas] = useState([])
  const [exames, setExames] = useState([])
  const [aba, setAba] = useState('consultas')
  const [formConsulta, setFormConsulta] = useState({ idUsuario: 1, descricao: '', conduta: '', diagnostico: '' })
  const [formExame, setFormExame] = useState({ tipoExame: '', resultado: '' })
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    prontuarioService.criar(idPaciente)
      .then(r => {
        setProntuario(r.data)
        return r.data.id
      })
      .then(idProntuario => {
        prontuarioService.listarConsultas(idProntuario).then(r => setConsultas(r.data))
        prontuarioService.listarExames(idProntuario).then(r => setExames(r.data))
      })
      .catch(() => {})
  }, [idPaciente])

  async function salvarConsulta(e) {
    e.preventDefault()
    await prontuarioService.adicionarConsulta(prontuario.id, formConsulta)
    const r = await prontuarioService.listarConsultas(prontuario.id)
    setConsultas(r.data)
    setMostrarForm(false)
  }

  async function salvarExame(e) {
    e.preventDefault()
    await prontuarioService.adicionarExame(prontuario.id, formExame)
    const r = await prontuarioService.listarExames(prontuario.id)
    setExames(r.data)
    setMostrarForm(false)
  }

  if (!prontuario) return <p>Carregando prontuário...</p>

  return (
    <div>
      <h1>Prontuário – Paciente #{idPaciente}</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Aberto em: {new Date(prontuario.dataCriacao).toLocaleDateString('pt-BR')}</p>

      {/* Abas */}
      <div style={{ borderBottom: '1px solid #eee', marginBottom: 24 }}>
        <button style={tabStyle(aba === 'consultas')} onClick={() => { setAba('consultas'); setMostrarForm(false) }}>
          Consultas ({consultas.length})
        </button>
        <button style={tabStyle(aba === 'exames')} onClick={() => { setAba('exames'); setMostrarForm(false) }}>
          Exames ({exames.length})
        </button>
      </div>

      {/* Botão adicionar */}
      <div style={{ marginBottom: 16 }}>
        <button style={btnStyle} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : `+ ${aba === 'consultas' ? 'Nova Consulta' : 'Novo Exame'}`}
        </button>
      </div>

      {/* Formulário consulta */}
      {mostrarForm && aba === 'consultas' && (
        <form onSubmit={salvarConsulta} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>Diagnóstico</label>
              <input style={inputStyle} value={formConsulta.diagnostico} onChange={e => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })} />
            </div>
            <div>
              <label>Descrição</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={formConsulta.descricao} onChange={e => setFormConsulta({ ...formConsulta, descricao: e.target.value })} />
            </div>
            <div>
              <label>Conduta</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={formConsulta.conduta} onChange={e => setFormConsulta({ ...formConsulta, conduta: e.target.value })} />
            </div>
          </div>
          <button type="submit" style={{ ...btnStyle, marginTop: 12 }}>Salvar Consulta</button>
        </form>
      )}

      {/* Formulário exame */}
      {mostrarForm && aba === 'exames' && (
        <form onSubmit={salvarExame} style={{ background: '#fff', padding: 20, borderRadius: 8, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>Tipo de Exame *</label>
              <input style={inputStyle} required value={formExame.tipoExame} onChange={e => setFormExame({ ...formExame, tipoExame: e.target.value })} />
            </div>
            <div>
              <label>Resultado</label>
              <textarea style={{ ...inputStyle, minHeight: 60 }} value={formExame.resultado} onChange={e => setFormExame({ ...formExame, resultado: e.target.value })} />
            </div>
          </div>
          <button type="submit" style={{ ...btnStyle, marginTop: 12 }}>Salvar Exame</button>
        </form>
      )}

      {/* Lista consultas */}
      {aba === 'consultas' && (
        consultas.length === 0
          ? <p style={{ color: '#888' }}>Nenhuma consulta registrada.</p>
          : consultas.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <strong>{c.diagnostico || 'Sem diagnóstico'}</strong>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>{new Date(c.dataConsulta).toLocaleDateString('pt-BR')}</span>
              {c.descricao && <p style={{ marginTop: 8, color: '#555' }}>{c.descricao}</p>}
              {c.conduta && <p style={{ color: '#555' }}><em>Conduta:</em> {c.conduta}</p>}
            </div>
          ))
      )}

      {/* Lista exames */}
      {aba === 'exames' && (
        exames.length === 0
          ? <p style={{ color: '#888' }}>Nenhum exame registrado.</p>
          : exames.map(e => (
            <div key={e.id} style={{ background: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <strong>{e.tipoExame}</strong>
              <span style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>{new Date(e.dataExame).toLocaleDateString('pt-BR')}</span>
              {e.resultado && <p style={{ marginTop: 8, color: '#555' }}>{e.resultado}</p>}
            </div>
          ))
      )}
    </div>
  )
}
