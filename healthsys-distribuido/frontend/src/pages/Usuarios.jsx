import { useEffect, useState } from 'react'
import { authService, usuarioService } from '../services/api'

const PERFIL_LABEL = {
  ADMIN: 'Administrador',
  PROFISSIONAL_SAUDE: 'Prof. de Saúde',
  ATENDENTE: 'Atendente',
  GESTOR: 'Gestor',
}

const FORM_VAZIO = { nome: '', email: '', senha: '', perfil: 'ATENDENTE' }

export default function Usuarios() {
  const [usuarios, setUsuarios]       = useState([])
  const [form, setForm]               = useState(FORM_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [loading, setLoading]         = useState(true)
  const [salvando, setSalvando]       = useState(false)
  const [erro, setErro]               = useState('')
  const [sucesso, setSucesso]         = useState('')

  async function carregar() {
    setLoading(true)
    try {
      const { data } = await usuarioService.listar()
      setUsuarios(data || [])
    } catch {
      setErro('Erro ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function handleCadastrar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    if (form.senha.length < 6) {
      setErro('Senha deve ter ao menos 6 caracteres.')
      return
    }
    setSalvando(true)
    try {
      await authService.registro(form)
      setSucesso(`Usuário "${form.nome}" cadastrado com sucesso!`)
      setMostrarForm(false)
      setForm(FORM_VAZIO)
      carregar()
    } catch (err) {
      setErro(err.response?.data?.message || 'Erro ao cadastrar usuário.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleDesativar(id, nome) {
    if (!confirm(`Desativar o usuário "${nome}"?`)) return
    try {
      await usuarioService.desativar(id)
      setSucesso(`Usuário "${nome}" desativado.`)
      carregar()
    } catch {
      setErro('Erro ao desativar usuário.')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerenciamento de contas e perfis de acesso</p>
        </div>
        <button
          className={mostrarForm ? 'btn btn-ghost' : 'btn btn-primary'}
          onClick={() => { setMostrarForm(!mostrarForm); setErro(''); setSucesso('') }}
        >
          {mostrarForm ? '✕ Cancelar' : '+ Novo Usuário'}
        </button>
      </div>

      {/* Alertas */}
      {sucesso && (
        <div className="alert alert-success" style={{ marginBottom: 20 }}>
          <span>✓</span> {sucesso}
        </div>
      )}
      {erro && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠️</span> {erro}
        </div>
      )}

      {/* Formulário */}
      {mostrarForm && (
        <div className="card" style={{ padding: 28, marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>
            Cadastrar Novo Usuário
          </h2>
          <form onSubmit={handleCadastrar}>
            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Nome completo *</label>
                <input
                  className="form-input"
                  required
                  placeholder="Ex: Dr. João Silva"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input
                  className="form-input"
                  type="email"
                  required
                  placeholder="email@healthsys.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Senha * (mín. 6 caracteres)</label>
                <input
                  className="form-input"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil *</label>
                <select
                  className="form-input"
                  value={form.perfil}
                  onChange={e => setForm({ ...form, perfil: e.target.value })}
                >
                  <option value="ATENDENTE">Atendente</option>
                  <option value="PROFISSIONAL_SAUDE">Profissional de Saúde</option>
                  <option value="GESTOR">Gestor</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" className="btn btn-primary" disabled={salvando}>
                {salvando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando...</> : 'Cadastrar'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setMostrarForm(false); setErro('') }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando...</div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Status</th>
                  <th style={{ width: 110 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 32 }}>
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : usuarios.map(u => (
                  <tr key={u.id} style={{ opacity: u.ativo ? 1 : 0.5 }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: 'var(--primary)',
                          flexShrink: 0,
                        }}>
                          {u.nome?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontWeight: 500 }}>{u.nome}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                    <td>
                      <span className={`badge perfil-${u.perfil}`}>
                        {PERFIL_LABEL[u.perfil] || u.perfil}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        fontSize: 12, fontWeight: 600,
                        color: u.ativo ? 'var(--success)' : 'var(--danger)',
                      }}>
                        <span style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: u.ativo ? 'var(--success)' : 'var(--danger)',
                          display: 'inline-block',
                        }} />
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      {u.ativo && (
                        <button
                          className="btn btn-sm"
                          style={{ background: 'var(--danger)', color: '#fff', border: 'none' }}
                          onClick={() => handleDesativar(u.id, u.nome)}
                        >
                          Desativar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
