import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService } from '../services/api'

const FORM_VAZIO    = { nome: '', dataNascimento: '', sexo: '', cpf: '', telefone: '', email: '', endereco: '' }
const ALERGIA_VAZIA = { descricao: '', tipo: 'MEDICAMENTO', gravidade: 'MODERADA' }
const VACINA_VAZIA  = { nomeVacina: '', dataAplicacao: '', lote: '' }

const GRAVIDADE_COR = { LEVE: 'risco-VERDE', MODERADA: 'risco-AMARELO', GRAVE: 'risco-VERMELHO' }
const SEXO_LABEL    = { MASCULINO: 'Masculino', FEMININO: 'Feminino', OUTRO: 'Outro' }

export default function Pacientes() {
  const [pacientes, setPacientes]   = useState([])
  const [busca, setBusca]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [salvando, setSalvando]     = useState(false)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)   // true = editando, false = novo
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm]             = useState(FORM_VAZIO)
  const [erro, setErro]             = useState('')
  const [sucesso, setSucesso]       = useState('')

  // Painel lateral
  const [painel, setPainel]         = useState(null) // 'alergias' | 'vacinas' | null
  const [pacSel, setPacSel]         = useState(null)
  const [alergias, setAlergias]     = useState([])
  const [vacinas, setVacinas]       = useState([])
  const [formAlergia, setFormAlergia] = useState(ALERGIA_VAZIA)
  const [formVacina, setFormVacina] = useState(VACINA_VAZIA)
  const [salvarAlergia, setSalvarAlergia] = useState(false)
  const [salvarVacina, setSalvarVacina]   = useState(false)

  const navigate = useNavigate()

  async function carregar(nome = '') {
    setLoading(true)
    try { const { data } = await pacienteService.listar(nome); setPacientes(data) }
    catch { setErro('Erro ao carregar pacientes.') }
    finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  async function handleCadastrar(e) {
    e.preventDefault(); setErro(''); setSucesso(''); setSalvando(true)
    try {
      await pacienteService.cadastrar(form)
      setSucesso(`Paciente "${form.nome}" cadastrado com sucesso!`)
      setMostrarForm(false); setForm(FORM_VAZIO); carregar()
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar paciente.')
    } finally { setSalvando(false) }
  }

  function abrirEdicao(p) {
    setModoEdicao(true)
    setEditandoId(p.id)
    setForm({
      nome: p.nome || '',
      dataNascimento: p.dataNascimento || '',
      sexo: p.sexo || '',
      cpf: p.cpf || '',
      telefone: p.telefone || '',
      email: p.email || '',
      endereco: p.endereco || '',
    })
    setMostrarForm(true)
    setErro(''); setSucesso('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleAtualizar(e) {
    e.preventDefault(); setErro(''); setSucesso(''); setSalvando(true)
    try {
      await pacienteService.atualizar(editandoId, form)
      setSucesso(`Paciente "${form.nome}" atualizado com sucesso!`)
      setMostrarForm(false); setModoEdicao(false); setEditandoId(null); setForm(FORM_VAZIO); carregar()
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao atualizar paciente.')
    } finally { setSalvando(false) }
  }

  async function abrirPainel(p, tipo) {
    setPacSel(p); setPainel(tipo)
    setFormAlergia(ALERGIA_VAZIA); setFormVacina(VACINA_VAZIA)
    if (tipo === 'alergias') {
      const { data } = await pacienteService.listarAlergias(p.id).catch(() => ({ data: [] }))
      setAlergias(data)
    } else {
      const { data } = await pacienteService.listarVacinas(p.id).catch(() => ({ data: [] }))
      setVacinas(data)
    }
  }

  async function handleAlergia(e) {
    e.preventDefault(); setSalvarAlergia(true)
    try {
      await pacienteService.registrarAlergia(pacSel.id, formAlergia)
      const { data } = await pacienteService.listarAlergias(pacSel.id)
      setAlergias(data); setFormAlergia(ALERGIA_VAZIA)
    } catch (err) { alert(err.response?.data?.message || 'Erro.') }
    finally { setSalvarAlergia(false) }
  }

  async function handleVacina(e) {
    e.preventDefault(); setSalvarVacina(true)
    try {
      await pacienteService.registrarVacina(pacSel.id, formVacina)
      const { data } = await pacienteService.listarVacinas(pacSel.id)
      setVacinas(data); setFormVacina(VACINA_VAZIA)
    } catch (err) { alert(err.response?.data?.message || 'Erro.') }
    finally { setSalvarVacina(false) }
  }

  async function removerAlergia(id) {
    if (!confirm('Remover esta alergia?')) return
    await pacienteService.removerAlergia(pacSel.id, id).catch(() => {})
    setAlergias(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">{pacientes.length} paciente(s) cadastrado(s)</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setMostrarForm(!mostrarForm)
          setModoEdicao(false); setEditandoId(null); setForm(FORM_VAZIO)
          setErro(''); setSucesso('')
        }}>
          {mostrarForm ? '✕ Cancelar' : '+ Novo Paciente'}
        </button>
      </div>

      {sucesso && <div className="alert alert-success">✓ {sucesso}</div>}
      {erro    && <div className="alert alert-error">⚠ {erro}</div>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 20, fontSize: 16 }}>
            {modoEdicao ? `Editar Paciente — ${form.nome}` : 'Cadastrar Novo Paciente'}
          </h3>
          <form onSubmit={modoEdicao ? handleAtualizar : handleCadastrar}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group col-span-2">
                <label className="form-label">Nome completo <span className="required">*</span></label>
                <input className="form-input" required value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Nome do paciente" />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Nascimento <span className="required">*</span></label>
                <input className="form-input" type="date" required value={form.dataNascimento} onChange={e => setForm({...form, dataNascimento: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Sexo</label>
                <select className="form-select" value={form.sexo} onChange={e => setForm({...form, sexo: e.target.value})}>
                  <option value="">Selecione</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMININO">Feminino</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input className="form-input" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} placeholder="000.000.000-00" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} placeholder="(85) 99999-9999" />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Endereço</label>
                <input className="form-input" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} placeholder="Rua, número, bairro, cidade" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{width:14,height:14}} /> Salvando...</> : modoEdicao ? 'Atualizar Paciente' : 'Salvar Paciente'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setMostrarForm(false); setModoEdicao(false); setErro('') }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Busca */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="form-input" style={{ maxWidth: 320 }}
          placeholder="🔍  Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && carregar(busca)}
        />
        <button className="btn btn-primary btn-sm" onClick={() => carregar(busca)}>Buscar</button>
        {busca && <button className="btn btn-ghost btn-sm" onClick={() => { setBusca(''); carregar() }}>Limpar</button>}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando pacientes...</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Nascimento</th>
                <th>Sexo</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.length === 0 ? (
                <tr className="table-empty"><td colSpan={6}>Nenhum paciente encontrado.</td></tr>
              ) : pacientes.map(p => (
                <tr key={p.id}>
                  <td><span style={{ fontWeight: 600 }}>{p.nome}</span></td>
                  <td style={{ color: 'var(--gray-500)', fontFamily: 'monospace' }}>{p.cpf || '—'}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{p.dataNascimento}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{SEXO_LABEL[p.sexo] || '—'}</td>
                  <td style={{ color: 'var(--gray-500)' }}>{p.telefone || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/prontuario/${p.id}`)}>📋 Prontuário</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirEdicao(p)}>✏️ Editar</button>
                      <button className="btn btn-warning btn-sm" onClick={() => abrirPainel(p, 'alergias')}>⚠️ Alergias</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirPainel(p, 'vacinas')}>💉 Vacinas</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Painel lateral de alergias/vacinas */}
      {painel && pacSel && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 480, height: '100vh',
          background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,.15)',
          display: 'flex', flexDirection: 'column', zIndex: 100,
        }}>
          {/* Header painel */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {painel === 'alergias' ? '⚠️ Alergias' : '💉 Vacinas'} — {pacSel.nome}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Paciente #{pacSel.id}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setPainel(null); setPacSel(null) }}>✕ Fechar</button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {painel === 'alergias' ? (
              <>
                {/* Form alergia */}
                <form onSubmit={handleAlergia} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16, marginBottom: 20, border: '1px solid var(--gray-200)' }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Registrar nova alergia</p>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Descrição <span className="required">*</span></label>
                    <input className="form-input" required value={formAlergia.descricao} onChange={e => setFormAlergia({...formAlergia, descricao: e.target.value})} placeholder="Ex: Dipirona, Amendoim..." />
                  </div>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Tipo</label>
                      <select className="form-select" value={formAlergia.tipo} onChange={e => setFormAlergia({...formAlergia, tipo: e.target.value})}>
                        <option value="MEDICAMENTO">Medicamento</option>
                        <option value="ALIMENTO">Alimento</option>
                        <option value="AMBIENTAL">Ambiental</option>
                        <option value="OUTRO">Outro</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Gravidade</label>
                      <select className="form-select" value={formAlergia.gravidade} onChange={e => setFormAlergia({...formAlergia, gravidade: e.target.value})}>
                        <option value="LEVE">Leve</option>
                        <option value="MODERADA">Moderada</option>
                        <option value="GRAVE">Grave</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-warning btn-sm" disabled={salvarAlergia}>
                    {salvarAlergia ? 'Salvando...' : '+ Adicionar'}
                  </button>
                </form>

                {/* Lista alergias */}
                {alergias.length === 0
                  ? <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 24 }}>Nenhuma alergia registrada.</p>
                  : alergias.map(a => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', marginBottom: 8, borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{a.descricao}</span>
                        <span style={{ marginLeft: 8, color: 'var(--gray-500)', fontSize: 12 }}>{a.tipo}</span>
                        <br />
                        <span className={`badge ${GRAVIDADE_COR[a.gravidade]}`} style={{ marginTop: 4, fontSize: 10 }}>{a.gravidade}</span>
                      </div>
                      <button className="btn btn-danger btn-sm" onClick={() => removerAlergia(a.id)}>Remover</button>
                    </div>
                  ))
                }
              </>
            ) : (
              <>
                {/* Form vacina */}
                <form onSubmit={handleVacina} style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 16, marginBottom: 20, border: '1px solid var(--gray-200)' }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Registrar nova vacina</p>
                  <div className="form-group" style={{ marginBottom: 12 }}>
                    <label className="form-label">Nome da vacina <span className="required">*</span></label>
                    <input className="form-input" required value={formVacina.nomeVacina} onChange={e => setFormVacina({...formVacina, nomeVacina: e.target.value})} placeholder="Ex: COVID-19, Influenza..." />
                  </div>
                  <div className="grid-2" style={{ marginBottom: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Data de aplicação <span className="required">*</span></label>
                      <input className="form-input" type="date" required value={formVacina.dataAplicacao} onChange={e => setFormVacina({...formVacina, dataAplicacao: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lote</label>
                      <input className="form-input" value={formVacina.lote} onChange={e => setFormVacina({...formVacina, lote: e.target.value})} placeholder="Ex: AB123" />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={salvarVacina}>
                    {salvarVacina ? 'Salvando...' : '+ Adicionar'}
                  </button>
                </form>

                {/* Lista vacinas */}
                {vacinas.length === 0
                  ? <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: 24 }}>Nenhuma vacina registrada.</p>
                  : vacinas.map(v => (
                    <div key={v.id} style={{ padding: '12px 14px', marginBottom: 8, borderRadius: 8, background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{v.nomeVacina}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                        {v.dataAplicacao}{v.lote ? ` · Lote: ${v.lote}` : ''}
                      </div>
                    </div>
                  ))
                }
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
