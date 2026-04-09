import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService } from '../services/api'

const inputStyle = { padding: 8, border: '1px solid #ccc', borderRadius: 4, width: '100%', boxSizing: 'border-box' }
const btnStyle = { padding: '8px 20px', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }

const FORM_VAZIO = { nome: '', dataNascimento: '', sexo: '', cpf: '', telefone: '', email: '', endereco: '' }
const ALERGIA_VAZIA = { descricao: '', tipo: 'MEDICAMENTO', gravidade: 'MODERADA' }

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([])
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState(FORM_VAZIO)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  // Alergias
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null)
  const [alergias, setAlergias] = useState([])
  const [formAlergia, setFormAlergia] = useState(ALERGIA_VAZIA)
  const [mostrarFormAlergia, setMostrarFormAlergia] = useState(false)
  const [salvarAlergia, setSalvarAlergia] = useState(false)

  const navigate = useNavigate()

  async function carregar(nome = '') {
    setCarregando(true)
    try {
      const { data } = await pacienteService.listar(nome)
      setPacientes(data)
    } catch {
      setErro('Erro ao carregar pacientes.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  function handleBusca(e) {
    e.preventDefault()
    carregar(busca)
  }

  async function handleCadastrar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setSalvando(true)
    try {
      await pacienteService.cadastrar(form)
      setSucesso(`Paciente "${form.nome}" cadastrado com sucesso!`)
      setMostrarForm(false)
      setForm(FORM_VAZIO)
      carregar()
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao cadastrar paciente. Verifique os dados.'
      setErro(msg)
    } finally {
      setSalvando(false)
    }
  }

  async function abrirAlergias(paciente) {
    setPacienteSelecionado(paciente)
    setMostrarFormAlergia(false)
    setFormAlergia(ALERGIA_VAZIA)
    try {
      const { data } = await pacienteService.listarAlergias(paciente.id)
      setAlergias(data)
    } catch {
      setAlergias([])
    }
  }

  async function handleRegistrarAlergia(e) {
    e.preventDefault()
    setSalvarAlergia(true)
    try {
      await pacienteService.registrarAlergia(pacienteSelecionado.id, formAlergia)
      const { data } = await pacienteService.listarAlergias(pacienteSelecionado.id)
      setAlergias(data)
      setMostrarFormAlergia(false)
      setFormAlergia(ALERGIA_VAZIA)
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao registrar alergia.')
    } finally {
      setSalvarAlergia(false)
    }
  }

  async function handleRemoverAlergia(alergiaId) {
    if (!confirm('Remover esta alergia?')) return
    try {
      await pacienteService.removerAlergia(pacienteSelecionado.id, alergiaId)
      setAlergias(prev => prev.filter(a => a.id !== alergiaId))
    } catch {
      alert('Erro ao remover alergia.')
    }
  }

  const gravidadeCor = { LEVE: '#38a169', MODERADA: '#d69e2e', GRAVE: '#e53e3e' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>Pacientes</h1>
        <button style={btnStyle} onClick={() => { setMostrarForm(!mostrarForm); setErro(''); setSucesso('') }}>
          {mostrarForm ? 'Cancelar' : '+ Novo Paciente'}
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
          <h3 style={{ marginBottom: 16 }}>Cadastrar Paciente</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Nome *</label>
              <input style={inputStyle} required value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Data de Nascimento *</label>
              <input type="date" style={inputStyle} required value={form.dataNascimento} onChange={e => setForm({ ...form, dataNascimento: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>CPF</label>
              <input style={inputStyle} value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Telefone</label>
              <input style={inputStyle} value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(85) 99999-9999" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>E-mail</label>
              <input type="email" style={inputStyle} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 4 }}>Sexo</label>
              <select style={inputStyle} value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: 4 }}>Endereço</label>
              <input style={inputStyle} value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} placeholder="Rua, número, bairro, cidade" />
            </div>
          </div>
          <button type="submit" disabled={salvando} style={{ ...btnStyle, marginTop: 16, opacity: salvando ? 0.7 : 1 }}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {/* Busca */}
      <form onSubmit={handleBusca} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          style={{ ...inputStyle, width: 300 }}
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <button type="submit" style={btnStyle}>Buscar</button>
        {busca && (
          <button type="button" style={{ ...btnStyle, background: '#718096' }} onClick={() => { setBusca(''); carregar() }}>
            Limpar
          </button>
        )}
      </form>

      {/* Tabela */}
      {carregando ? (
        <p style={{ color: '#888' }}>Carregando pacientes...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nome</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>CPF</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nascimento</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Telefone</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 16, color: '#888', textAlign: 'center' }}>Nenhum paciente encontrado.</td></tr>
            ) : pacientes.map(p => (
              <tr key={p.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px' }}>{p.nome}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{p.cpf || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{p.dataNascimento}</td>
                <td style={{ padding: '12px 16px', color: '#555' }}>{p.telefone || '—'}</td>
                <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                  <button
                    style={{ ...btnStyle, padding: '4px 12px', fontSize: 13 }}
                    onClick={() => navigate(`/prontuario/${p.id}`)}
                  >
                    Prontuário
                  </button>
                  <button
                    style={{ ...btnStyle, padding: '4px 12px', fontSize: 13, background: '#dd6b20' }}
                    onClick={() => abrirAlergias(p)}
                  >
                    Alergias
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Painel de alergias */}
      {pacienteSelecionado && (
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3>Alergias – {pacienteSelecionado.nome}</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ ...btnStyle, background: '#dd6b20' }} onClick={() => setMostrarFormAlergia(!mostrarFormAlergia)}>
                {mostrarFormAlergia ? 'Cancelar' : '+ Nova Alergia'}
              </button>
              <button style={{ ...btnStyle, background: '#718096' }} onClick={() => setPacienteSelecionado(null)}>
                Fechar
              </button>
            </div>
          </div>

          {mostrarFormAlergia && (
            <form onSubmit={handleRegistrarAlergia} style={{ background: '#f9f9f9', padding: 16, borderRadius: 6, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: 4 }}>Descrição *</label>
                  <input style={inputStyle} required value={formAlergia.descricao}
                    onChange={e => setFormAlergia({ ...formAlergia, descricao: e.target.value })}
                    placeholder="Ex: Dipirona, Amendoim..." />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>Tipo</label>
                  <select style={inputStyle} value={formAlergia.tipo} onChange={e => setFormAlergia({ ...formAlergia, tipo: e.target.value })}>
                    <option value="MEDICAMENTO">Medicamento</option>
                    <option value="ALIMENTO">Alimento</option>
                    <option value="AMBIENTAL">Ambiental</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 4 }}>Gravidade</label>
                  <select style={inputStyle} value={formAlergia.gravidade} onChange={e => setFormAlergia({ ...formAlergia, gravidade: e.target.value })}>
                    <option value="LEVE">Leve</option>
                    <option value="MODERADA">Moderada</option>
                    <option value="GRAVE">Grave</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={salvarAlergia} style={{ ...btnStyle, background: '#dd6b20', opacity: salvarAlergia ? 0.7 : 1 }}>
                {salvarAlergia ? 'Salvando...' : 'Registrar Alergia'}
              </button>
            </form>
          )}

          {alergias.length === 0 ? (
            <p style={{ color: '#888' }}>Nenhuma alergia registrada.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {alergias.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff8f0', borderRadius: 6, border: '1px solid #fbd38d' }}>
                  <div>
                    <strong>{a.descricao}</strong>
                    <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{a.tipo}</span>
                    <span style={{ background: gravidadeCor[a.gravidade], color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: 12, marginLeft: 8 }}>
                      {a.gravidade}
                    </span>
                  </div>
                  <button
                    style={{ padding: '3px 10px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
                    onClick={() => handleRemoverAlergia(a.id)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
