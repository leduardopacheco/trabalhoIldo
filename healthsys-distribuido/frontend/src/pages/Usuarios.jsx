import { useEffect, useState } from 'react'
import { authService, usuarioService } from '../services/api'

const inputStyle = { padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }
const btnStyle = { padding: '8px 20px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }

const perfilLabel = {
  ADMIN: 'Administrador',
  PROFISSIONAL_SAUDE: 'Profissional de Saúde',
  ATENDENTE: 'Atendente',
  GESTOR: 'Gestor',
}

const perfilCor = {
  ADMIN: '#e53e3e',
  PROFISSIONAL_SAUDE: '#38a169',
  ATENDENTE: '#3182ce',
  GESTOR: '#d69e2e',
}

const FORM_VAZIO = { nome: '', email: '', senha: '', perfil: 'ATENDENTE' }

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  async function carregar() {
    setCarregando(true)
    try {
      const { data } = await usuarioService.listar()
      setUsuarios(data)
    } catch {
      setErro('Erro ao carregar usuários.')
    } finally {
      setCarregando(false)
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
      const msg = err.response?.data?.message || 'Erro ao cadastrar usuário.'
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function handleDesativar(id, nome) {
    if (!confirm(`Desativar usuário "${nome}"?`)) return
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Usuários</h1>
        <button style={btnStyle} onClick={() => { setMostrarForm(!mostrarForm); setErro(''); setSucesso('') }}>
          {mostrarForm ? 'Cancelar' : '+ Novo Usuário'}
        </button>
      </div>

      {sucesso && (
        <div style={{ background: '#f0fff4', border: '1px solid #9ae6b4', borderRadius: 4, padding: 12, marginBottom: 16, color: '#276749' }}>
          {sucesso}
        </div>
      )}

      {erro && (
        <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 4, padding: 12, marginBottom: 16, color: '#c53030' }}>
          {erro}
        </div>
      )}

      {/* Formulário de cadastro */}
      {mostrarForm && (
        <form onSubmit={handleCadastrar} style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: 16 }}>Cadastrar Novo Usuário</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Nome completo *</label>
              <input
                style={inputStyle}
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Dr. João Silva"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>E-mail *</label>
              <input
                type="email"
                style={inputStyle}
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@healthsys.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Senha * (mín. 6 caracteres)</label>
              <input
                type="password"
                style={inputStyle}
                required
                minLength={6}
                value={form.senha}
                onChange={e => setForm({ ...form, senha: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Perfil *</label>
              <select
                style={inputStyle}
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
          <button type="submit" disabled={salvando} style={{ ...btnStyle, marginTop: 16, opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Salvando...' : 'Cadastrar Usuário'}
          </button>
        </form>
      )}

      {/* Tabela */}
      {carregando ? (
        <p style={{ color: '#888' }}>Carregando usuários...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>E-mail</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Perfil</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, color: '#888', textAlign: 'center' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : usuarios.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #eee', opacity: u.ativo ? 1 : 0.5 }}>
                <td style={{ padding: '12px 16px' }}>{u.nome}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{u.email}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: perfilCor[u.perfil] || '#ccc',
                    color: '#fff',
                    padding: '2px 10px',
                    borderRadius: 12,
                    fontSize: 12
                  }}>
                    {perfilLabel[u.perfil] || u.perfil}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: u.ativo ? '#38a169' : '#e53e3e', fontWeight: 'bold', fontSize: 13 }}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {u.ativo && (
                    <button
                      style={{ padding: '4px 12px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
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
      )}
    </div>
  )
}
