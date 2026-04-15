import { useEffect, useState } from 'react'
import { triagemService, pacienteService } from '../services/api'

const RISCOS = ['VERMELHO', 'LARANJA', 'AMARELO', 'VERDE', 'AZUL']
const RISCO_LABEL = {
  VERMELHO: 'Emergência',
  LARANJA: 'Muito urgente',
  AMARELO: 'Urgente',
  VERDE: 'Pouco urgente',
  AZUL: 'Não urgente',
}
const RISCO_ICON = { VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵' }

const FORM_VAZIO = { idPaciente: '', idUsuario: 1, sintomas: '', nivelRisco: 'VERDE' }

export default function Triagem() {
  const [triagens, setTriagens]       = useState([])
  const [pacientes, setPacientes]     = useState([])
  const [buscaPac, setBuscaPac]       = useState('')
  const [form, setForm]               = useState(FORM_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading]         = useState(true)
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState('')

  useEffect(() => {
    pacienteService.listar().then(r => setPacientes(r.data || [])).catch(() => {})
  }, [])

  const pacientesFiltrados = buscaPac.trim()
    ? pacientes.filter(p => p.nome?.toLowerCase().includes(buscaPac.toLowerCase()) || String(p.id).includes(buscaPac))
    : pacientes.slice(0, 8)

  function carregar() {
    setLoading(true)
    triagemService.listarAguardando()
      .then(r => setTriagens(r.data || []))
      .catch(() => setTriagens([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setSalvando(true)
    try {
      await triagemService.realizar({ ...form, idPaciente: Number(form.idPaciente) })
      setMostrarForm(false)
      setForm(FORM_VAZIO)
      setBuscaPac('')
      carregar()
    } catch {
      setErro('Erro ao registrar triagem. Verifique os dados e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  async function atualizarStatus(id, status) {
    await triagemService.atualizarStatus(id, status)
    carregar()
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Triagem</h1>
          <p className="page-subtitle">Protocolo de Manchester — fila de atendimento em tempo real</p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-ghost' : 'btn btn-primary'}
          onClick={() => { setMostrarForm(!mostrarForm); setErro('') }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Nova Triagem'}
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>
            Registrar Nova Triagem
          </h2>
          {erro && (
            <div className="alert alert-error" style={{ marginBottom: 16 }}>
              <span>⚠️</span> {erro}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Paciente *</label>
                <input
                  className="form-input"
                  placeholder="Buscar por nome ou ID..."
                  value={buscaPac}
                  onChange={e => { setBuscaPac(e.target.value); setForm({ ...form, idPaciente: '' }) }}
                  style={{ marginBottom: 6 }}
                />
                {pacientesFiltrados.length > 0 && (
                  <div style={{
                    border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)',
                    background: '#fff', maxHeight: 160, overflowY: 'auto',
                    boxShadow: 'var(--shadow)',
                  }}>
                    {pacientesFiltrados.map(p => (
                      <div
                        key={p.id}
                        onClick={() => { setForm({ ...form, idPaciente: p.id }); setBuscaPac(`${p.nome} (ID: ${p.id})`) }}
                        style={{
                          padding: '8px 12px', cursor: 'pointer', fontSize: 13,
                          background: form.idPaciente === p.id ? 'var(--primary-light)' : 'transparent',
                          borderBottom: '1px solid var(--gray-100)',
                          color: form.idPaciente === p.id ? 'var(--primary)' : 'var(--gray-700)',
                          fontWeight: form.idPaciente === p.id ? 600 : 400,
                        }}
                      >
                        <strong>#{p.id}</strong> — {p.nome}
                        {p.cpf && <span style={{ color: 'var(--gray-400)', marginLeft: 6 }}>{p.cpf}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {form.idPaciente && (
                  <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>
                    ✓ Paciente selecionado: ID {form.idPaciente}
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Nível de Risco *</label>
                <select
                  className="form-input"
                  value={form.nivelRisco}
                  onChange={e => setForm({ ...form, nivelRisco: e.target.value })}
                >
                  {RISCOS.map(r => (
                    <option key={r} value={r}>
                      {RISCO_ICON[r]} {r} — {RISCO_LABEL[r]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Sintomas *</label>
              <textarea
                className="form-input"
                required
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="Descreva os sintomas do paciente..."
                value={form.sintomas}
                onChange={e => setForm({ ...form, sintomas: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando...</> : 'Registrar Triagem'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setMostrarForm(false); setErro('') }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Resumo por nível */}
      {!loading && triagens.length > 0 && (
        <div className="grid-5" style={{ marginBottom: 24 }}>
          {RISCOS.map(r => {
            const count = triagens.filter(t => t.nivelRisco === r).length
            return (
              <div key={r} className="card" style={{ padding: '12px 16px', borderTop: `3px solid var(--risco-${r.toLowerCase()})` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{r}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: `var(--risco-${r.toLowerCase()})` }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{RISCO_LABEL[r]}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Fila */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-800)' }}>
          Fila de Atendimento
          {!loading && <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: 'var(--gray-400)' }}>({triagens.length})</span>}
        </h2>
        <button className="btn btn-ghost btn-sm" onClick={carregar}>↺ Atualizar</button>
      </div>

      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando...</div>
      ) : triagens.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Fila vazia</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Todos os pacientes foram atendidos</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {triagens.map(t => (
            <div
              key={t.id}
              className="card"
              style={{
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderLeft: `4px solid var(--risco-${t.nivelRisco?.toLowerCase()})`,
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{RISCO_ICON[t.nivelRisco]}</span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span className={`badge risco-${t.nivelRisco}`}>{t.nivelRisco}</span>
                  <span style={{ fontWeight: 600, color: 'var(--gray-800)' }}>Paciente #{t.idPaciente}</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                    {new Date(t.dataTriagem).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p style={{
                  fontSize: 13,
                  color: 'var(--gray-500)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: 0,
                }}>
                  {t.sintomas}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  className="btn btn-sm"
                  style={{ background: 'var(--success)', color: '#fff', border: 'none' }}
                  onClick={() => atualizarStatus(t.id, 'EM_ATENDIMENTO')}
                >
                  ▶ Iniciar
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => atualizarStatus(t.id, 'CONCLUIDA')}
                >
                  ✓ Concluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
