import { useEffect, useState } from 'react'
import { triagemService, notificacaoService } from '../services/api'

const card = { background: '#fff', borderRadius: 8, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.1)', flex: 1, minWidth: 180 }
const riscoCor = { VERMELHO: '#e53e3e', LARANJA: '#dd6b20', AMARELO: '#d69e2e', VERDE: '#38a169', AZUL: '#3182ce' }

export default function Dashboard() {
  const [triagens, setTriagens] = useState([])
  const [notificacoes, setNotificacoes] = useState(0)

  useEffect(() => {
    triagemService.listarAguardando()
      .then(r => setTriagens(r.data))
      .catch(() => {})

    const idUsuario = 1 // extrair do token JWT em produção
    notificacaoService.contarNaoLidas(idUsuario)
      .then(r => setNotificacoes(r.data.naoLidas))
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard Hospitalar</h1>

      {/* Cards de resumo */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <div style={card}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#0066cc' }}>{triagens.length}</div>
          <div style={{ color: '#666', marginTop: 4 }}>Triagens aguardando</div>
        </div>
        <div style={card}>
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#e53e3e' }}>{notificacoes}</div>
          <div style={{ color: '#666', marginTop: 4 }}>Notificações não lidas</div>
        </div>
      </div>

      {/* Fila de triagem */}
      <h2 style={{ marginBottom: 12 }}>Fila de Triagem</h2>
      {triagens.length === 0 ? (
        <p style={{ color: '#888' }}>Nenhuma triagem aguardando.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Paciente</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Nível de Risco</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Data</th>
            </tr>
          </thead>
          <tbody>
            {triagens.map(t => (
              <tr key={t.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '12px 16px' }}>#{t.id}</td>
                <td style={{ padding: '12px 16px' }}>Paciente {t.idPaciente}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: riscoCor[t.nivelRisco] || '#ccc', color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 13 }}>
                    {t.nivelRisco}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#666', fontSize: 13 }}>
                  {new Date(t.dataTriagem).toLocaleString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
