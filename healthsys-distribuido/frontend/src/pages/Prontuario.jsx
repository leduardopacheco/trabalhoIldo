import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { prontuarioService, pacienteService } from '../services/api'

const FORM_CONSULTA    = { idUsuario: 1, descricao: '', conduta: '', diagnostico: '' }
const FORM_EXAME       = { tipoExame: '', resultado: '' }
const FORM_MEDICAMENTO = { nome: '', dosagem: '', frequencia: '', duracao: '', observacoes: '' }

export default function Prontuario() {
  const { id: idPaciente } = useParams()
  const navigate = useNavigate()

  const [paciente, setPaciente]               = useState(null)
  const [prontuario, setProntuario]           = useState(null)
  const [consultas, setConsultas]             = useState([])
  const [exames, setExames]                   = useState([])
  const [medicamentos, setMedicamentos]       = useState([])
  const [aba, setAba]                         = useState('consultas')
  const [formConsulta, setFormConsulta]       = useState(FORM_CONSULTA)
  const [formExame, setFormExame]             = useState(FORM_EXAME)
  const [formMed, setFormMed]                 = useState({ ...FORM_MEDICAMENTO, idConsulta: '' })
  const [mostrarForm, setMostrarForm]         = useState(false)
  const [loading, setLoading]                 = useState(true)
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState('')

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      try {
        const [pacRes, pronRes] = await Promise.all([
          pacienteService.buscar(idPaciente).catch(() => null),
          prontuarioService.criar(idPaciente),
        ])
        if (pacRes) setPaciente(pacRes.data)
        const p = pronRes.data
        setProntuario(p)
        const [cRes, eRes, mRes] = await Promise.all([
          prontuarioService.listarConsultas(p.id),
          prontuarioService.listarExames(p.id),
          prontuarioService.listarMedicamentos(p.id),
        ])
        setConsultas(cRes.data || [])
        setExames(eRes.data || [])
        setMedicamentos(mRes.data || [])
      } catch {
        setErro('Erro ao carregar prontuário.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [idPaciente])

  async function salvarConsulta(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await prontuarioService.adicionarConsulta(prontuario.id, formConsulta)
      const r = await prontuarioService.listarConsultas(prontuario.id)
      setConsultas(r.data || [])
      setFormConsulta(FORM_CONSULTA)
      setMostrarForm(false)
    } catch {
      setErro('Erro ao salvar consulta.')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarExame(e) {
    e.preventDefault()
    setSalvando(true)
    try {
      await prontuarioService.adicionarExame(prontuario.id, formExame)
      const r = await prontuarioService.listarExames(prontuario.id)
      setExames(r.data || [])
      setFormExame(FORM_EXAME)
      setMostrarForm(false)
    } catch {
      setErro('Erro ao salvar exame.')
    } finally {
      setSalvando(false)
    }
  }

  async function salvarMedicamento(e) {
    e.preventDefault()
    if (!formMed.idConsulta) { setErro('Selecione uma consulta para vincular o medicamento.'); return }
    setSalvando(true)
    try {
      const { idConsulta, ...dados } = formMed
      await prontuarioService.adicionarMedicamento(prontuario.id, idConsulta, dados)
      const r = await prontuarioService.listarMedicamentos(prontuario.id)
      setMedicamentos(r.data || [])
      setFormMed({ ...FORM_MEDICAMENTO, idConsulta: '' })
      setMostrarForm(false)
    } catch {
      setErro('Erro ao salvar medicamento.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-block card" style={{ marginTop: 40 }}>
        <span className="spinner" /> Carregando prontuário...
      </div>
    )
  }

  if (!prontuario) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontWeight: 600, color: 'var(--gray-600)' }}>Prontuário não encontrado</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/prontuario-lista')}>
          ← Voltar
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/prontuario-lista')}
              style={{ padding: '4px 10px' }}
            >
              ← Prontuários
            </button>
          </div>
          <h1 className="page-title">
            {paciente ? paciente.nome : `Paciente #${idPaciente}`}
          </h1>
          <p className="page-subtitle">
            Prontuário #{prontuario.id}
            {prontuario.dataCriacao && ` · Aberto em ${new Date(prontuario.dataCriacao).toLocaleDateString('pt-BR')}`}
          </p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-ghost' : 'btn btn-primary'}
          onClick={() => { setMostrarForm(!mostrarForm); setErro('') }}
        >
          {mostrarForm
            ? '✕ Cancelar'
            : aba === 'consultas' ? '+ Nova Consulta'
            : aba === 'exames'   ? '+ Novo Exame'
            : '+ Novo Medicamento'}
        </button>
      </div>

      {/* Info paciente */}
      {paciente && (
        <div className="card" style={{ padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {[
            ['CPF', paciente.cpf],
            ['Nascimento', paciente.dataNascimento ? new Date(paciente.dataNascimento).toLocaleDateString('pt-BR') : null],
            ['Telefone', paciente.telefone],
            ['E-mail', paciente.email],
          ].filter(([, v]) => v).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: 14, color: 'var(--gray-700)', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {erro && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          <span>⚠️</span> {erro}
        </div>
      )}

      {/* Abas */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button
          className={`tab ${aba === 'consultas' ? 'tab-active' : ''}`}
          onClick={() => { setAba('consultas'); setMostrarForm(false); setErro('') }}
        >
          Consultas <span style={{ marginLeft: 6, background: 'var(--gray-100)', borderRadius: 99, padding: '1px 7px', fontSize: 12, fontWeight: 600 }}>{consultas.length}</span>
        </button>
        <button
          className={`tab ${aba === 'exames' ? 'tab-active' : ''}`}
          onClick={() => { setAba('exames'); setMostrarForm(false); setErro('') }}
        >
          Exames <span style={{ marginLeft: 6, background: 'var(--gray-100)', borderRadius: 99, padding: '1px 7px', fontSize: 12, fontWeight: 600 }}>{exames.length}</span>
        </button>
        <button
          className={`tab ${aba === 'medicamentos' ? 'tab-active' : ''}`}
          onClick={() => { setAba('medicamentos'); setMostrarForm(false); setErro('') }}
        >
          Medicamentos <span style={{ marginLeft: 6, background: 'var(--gray-100)', borderRadius: 99, padding: '1px 7px', fontSize: 12, fontWeight: 600 }}>{medicamentos.length}</span>
        </button>
      </div>

      {/* Formulário consulta */}
      {mostrarForm && aba === 'consultas' && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>Nova Consulta</h3>
          <form onSubmit={salvarConsulta}>
            <div className="form-group">
              <label className="form-label">Diagnóstico</label>
              <input
                className="form-input"
                placeholder="Ex: Hipertensão arterial"
                value={formConsulta.diagnostico}
                onChange={e => setFormConsulta({ ...formConsulta, diagnostico: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição da consulta</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="Descreva a consulta..."
                value={formConsulta.descricao}
                onChange={e => setFormConsulta({ ...formConsulta, descricao: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Conduta</label>
              <textarea
                className="form-input"
                rows={2}
                style={{ resize: 'vertical' }}
                placeholder="Conduta médica adotada..."
                value={formConsulta.conduta}
                onChange={e => setFormConsulta({ ...formConsulta, conduta: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando...</> : 'Salvar Consulta'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário exame */}
      {mostrarForm && aba === 'exames' && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>Novo Exame</h3>
          <form onSubmit={salvarExame}>
            <div className="form-group">
              <label className="form-label">Tipo de Exame *</label>
              <input
                className="form-input"
                required
                placeholder="Ex: Hemograma completo"
                value={formExame.tipoExame}
                onChange={e => setFormExame({ ...formExame, tipoExame: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Resultado</label>
              <textarea
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
                placeholder="Resultado do exame..."
                value={formExame.resultado}
                onChange={e => setFormExame({ ...formExame, resultado: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando...</> : 'Salvar Exame'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista consultas */}
      {aba === 'consultas' && (
        consultas.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
            <div style={{ fontWeight: 600, color: 'var(--gray-500)' }}>Nenhuma consulta registrada</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Nova Consulta" para adicionar</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {consultas.map(c => (
              <div key={c.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)' }}>
                      {c.diagnostico || 'Sem diagnóstico'}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {c.dataConsulta ? new Date(c.dataConsulta).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
                {c.descricao && (
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: '0 0 6px' }}>{c.descricao}</p>
                )}
                {c.conduta && (
                  <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: 0 }}>
                    <strong style={{ color: 'var(--gray-700)' }}>Conduta:</strong> {c.conduta}
                  </p>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Formulário medicamento */}
      {mostrarForm && aba === 'medicamentos' && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--gray-800)' }}>Novo Medicamento</h3>
          <form onSubmit={salvarMedicamento}>
            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Vincular à consulta *</label>
              <select
                className="form-input"
                required
                value={formMed.idConsulta}
                onChange={e => setFormMed({ ...formMed, idConsulta: e.target.value })}
              >
                <option value="">Selecione uma consulta...</option>
                {consultas.map(c => (
                  <option key={c.id} value={c.id}>
                    #{c.id} — {c.diagnostico || 'Sem diagnóstico'} ({c.dataConsulta ? new Date(c.dataConsulta).toLocaleDateString('pt-BR') : '—'})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid-2" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Nome do Medicamento *</label>
                <input className="form-input" required placeholder="Ex: Paracetamol" value={formMed.nome} onChange={e => setFormMed({ ...formMed, nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Dosagem</label>
                <input className="form-input" placeholder="Ex: 500mg" value={formMed.dosagem} onChange={e => setFormMed({ ...formMed, dosagem: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Frequência</label>
                <input className="form-input" placeholder="Ex: 8 em 8 horas" value={formMed.frequencia} onChange={e => setFormMed({ ...formMed, frequencia: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Duração</label>
                <input className="form-input" placeholder="Ex: 7 dias" value={formMed.duracao} onChange={e => setFormMed({ ...formMed, duracao: e.target.value })} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Observações</label>
              <textarea className="form-input" rows={2} style={{ resize: 'vertical' }} placeholder="Instruções de uso..." value={formMed.observacoes} onChange={e => setFormMed({ ...formMed, observacoes: e.target.value })} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando...</> : 'Salvar Medicamento'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setMostrarForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista medicamentos */}
      {aba === 'medicamentos' && (
        medicamentos.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>💊</div>
            <div style={{ fontWeight: 600, color: 'var(--gray-500)' }}>Nenhum medicamento prescrito</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Novo Medicamento" para adicionar</div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Dosagem</th>
                    <th>Frequência</th>
                    <th>Duração</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {medicamentos.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.nome}</td>
                      <td>{m.dosagem || '—'}</td>
                      <td>{m.frequencia || '—'}</td>
                      <td>{m.duracao || '—'}</td>
                      <td style={{ color: 'var(--gray-500)', fontSize: 13 }}>{m.observacoes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Lista exames */}
      {aba === 'exames' && (
        exames.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔬</div>
            <div style={{ fontWeight: 600, color: 'var(--gray-500)' }}>Nenhum exame registrado</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Clique em "+ Novo Exame" para adicionar</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {exames.map(ex => (
              <div key={ex.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)' }}>{ex.tipoExame}</span>
                  <span style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {ex.dataExame ? new Date(ex.dataExame).toLocaleDateString('pt-BR') : '—'}
                  </span>
                </div>
                {ex.resultado && (
                  <p style={{ fontSize: 14, color: 'var(--gray-600)', margin: 0 }}>{ex.resultado}</p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
