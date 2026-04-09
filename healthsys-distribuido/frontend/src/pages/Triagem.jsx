import { useEffect, useState } from 'react'
import { triagemService } from '../services/api'

const inputStyle = { padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }
const btnStyle = { padding: '8px 20px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }
const riscoCor = { VERMELHO: '#e53e3e', LARANJA: '#dd6b20', AMARELO: '#d69e2e', VERDE: '#38a169', AZUL: '#3182ce' }

export default function Triagem() {
  const [triagens, setTriagens] = useState([])
  const [form, setForm] = useState({ idPaciente: '', idUsuario: 1, sintomas: '', nivelRisco: 'VERDE' })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [erro, setErro] = useState('')

  function carregar() {
    triagemService.listarAguardando()
      .then(r => setTriagens(r.data))
      .catch(() => setTriagens([]))
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    try {
      await triagemService.realizar({ ...form, idPaciente: Number(form.idPaciente) })
      setMostrarForm(false)
      setForm({ idPaciente: '', idUsuario: 1, sintomas: '', nivelRisco: 'VERDE' })
      carregar()
    } catch {
      setErro('Erro ao registrar triagem.')
    }
  }

  async function atualizarStatus(id, status) {
    await triagemService.atualizarStatus(id, status)
    carregar()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Triagem</h1>
        <button style={btnStyle} onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : '+ Nova Triagem'}
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Registrar Triagem</h3>
          {erro && <p style={{ color: 'red', marginBottom: 12 }}>{erro}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label>ID do Paciente *</label>
              <input type="number" style={inputStyle} required value={form.idPaciente}
                onChange={e => setForm({ ...form, idPaciente: e.target.value })} />
            </div>
            <div>
              <label>Nível de Risco *</label>
              <select style={inputStyle} value={form.nivelRisco} onChange={e => setForm({ ...form, nivelRisco: e.target.value })}>
                <option value="VERMELHO">VERMELHO – Emergência</option>
                <option value="LARANJA">LARANJA – Muito urgente</option>
                <option value="AMARELO">AMARELO – Urgente</option>
                <option value="VERDE">VERDE – Pouco urgente</option>
                <option value="AZUL">AZUL – Não urgente</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Sintomas *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                required
                value={form.sintomas}
                onChange={e => setForm({ ...form, sintomas: e.target.value })}
                placeholder="Descreva os sintomas do paciente..."
              />
            </div>
          </div>
          <button type="submit" style={{ ...btnStyle, marginTop: 16 }}>Registrar</button>
        </form>
      )}

      {/* Fila de triagem */}
      <h2 style={{ marginBottom: 12 }}>Fila de Atendimento</h2>
      {triagens.length === 0 ? (
        <p style={{ color: '#888' }}>Nenhuma triagem aguardando.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {triagens.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', borderLeft: `4px solid ${riscoCor[t.nivelRisco]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ background: riscoCor[t.nivelRisco], color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 13, marginRight: 12 }}>
                    {t.nivelRisco}
                  </span>
                  <strong>Paciente #{t.idPaciente}</strong>
                  <span style={{ color: '#888', fontSize: 13, marginLeft: 12 }}>
                    {new Date(t.dataTriagem).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={{ ...btnStyle, background: '#38a169', padding: '4px 12px' }}
                    onClick={() => atualizarStatus(t.id, 'EM_ATENDIMENTO')}
                  >
                    Iniciar
                  </button>
                  <button
                    style={{ ...btnStyle, background: '#718096', padding: '4px 12px' }}
                    onClick={() => atualizarStatus(t.id, 'CONCLUIDA')}
                  >
                    Concluir
                  </button>
                </div>
              </div>
              <p style={{ marginTop: 8, color: '#555', fontSize: 14 }}>{t.sintomas}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
