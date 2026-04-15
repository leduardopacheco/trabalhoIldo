import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { pacienteService, prontuarioService } from '../services/api'

export default function ProntuarioLista() {
  const [pacientes, setPacientes] = useState([])
  const [busca, setBusca]         = useState('')
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    pacienteService.listar()
      .then(r => setPacientes(r.data || []))
      .catch(() => setPacientes([]))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = pacientes.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    String(p.id).includes(busca)
  )

  async function abrirProntuario(idPaciente) {
    try {
      await prontuarioService.criar(idPaciente)
    } catch {
      // já existe — ignorar
    }
    navigate(`/prontuario/${idPaciente}`)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Prontuários</h1>
          <p className="page-subtitle">Acesse o prontuário eletrônico de cada paciente</p>
        </div>
      </div>

      {/* Busca */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          style={{ maxWidth: 360 }}
          placeholder="Buscar por nome ou ID do paciente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, color: 'var(--gray-600)' }}>
            {busca ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {busca ? 'Tente uma busca diferente' : 'Cadastre pacientes primeiro'}
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>#</th>
                  <th>Paciente</th>
                  <th>CPF</th>
                  <th>Data de Nascimento</th>
                  <th style={{ width: 140 }}>Prontuário</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--gray-400)', fontSize: 13 }}>{p.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'var(--primary-light)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, color: 'var(--primary)',
                          flexShrink: 0,
                        }}>
                          {p.nome?.[0]?.toUpperCase() || 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.nome}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{p.email || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--gray-500)', fontFamily: 'monospace' }}>{p.cpf || '—'}</td>
                    <td style={{ color: 'var(--gray-500)' }}>
                      {p.dataNascimento
                        ? new Date(p.dataNascimento).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => abrirProntuario(p.id)}
                      >
                        📋 Abrir
                      </button>
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
