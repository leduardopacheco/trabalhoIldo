import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { triagemService, notificacaoService, pacienteService } from '../services/api'

function StatCard({ label, value, sub, color = 'var(--primary)', icon }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500, marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color + '18',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>{icon}</div>
      </div>
    </div>
  )
}

const RISCO_COR  = { VERMELHO: 'var(--risco-vermelho)', LARANJA: 'var(--risco-laranja)', AMARELO: 'var(--risco-amarelo)', VERDE: 'var(--risco-verde)', AZUL: 'var(--risco-azul)' }
const RISCO_ICON = { VERMELHO: '🔴', LARANJA: '🟠', AMARELO: '🟡', VERDE: '🟢', AZUL: '🔵' }

function decodeJwt() {
  try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])) } catch { return null }
}

export default function Dashboard() {
  const [triagens, setTriagens]         = useState([])
  const [totalPacientes, setTotal]      = useState(null)
  const [naoLidas, setNaoLidas]         = useState(null)
  const [loading, setLoading]           = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const payload = decodeJwt()
    Promise.allSettled([
      triagemService.listarAguardando(),
      pacienteService.listar(),
      payload ? notificacaoService.contarNaoLidas(1) : Promise.resolve(null),
    ]).then(([t, p, n]) => {
      if (t.status === 'fulfilled') setTriagens(t.value.data || [])
      if (p.status === 'fulfilled') setTotal((p.value.data || []).length)
      if (n.status === 'fulfilled' && n.value) setNaoLidas(n.value.data?.naoLidas ?? 0)
      setLoading(false)
    })
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Visão geral da unidade hospitalar em tempo real</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/triagem')}>
          + Nova Triagem
        </button>
      </div>

      {/* Cards */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        <StatCard
          label="Triagens aguardando"
          value={loading ? '…' : triagens.length}
          icon="🚨"
          color="var(--risco-vermelho)"
          sub="na fila de atendimento"
        />
        <StatCard
          label="Total de pacientes"
          value={loading ? '…' : totalPacientes}
          icon="👤"
          color="var(--primary)"
          sub="cadastrados no sistema"
        />
        <StatCard
          label="Notificações"
          value={loading ? '…' : (naoLidas ?? 0)}
          icon="🔔"
          color="var(--warning)"
          sub="não lidas"
        />
        <StatCard
          label="Serviços ativos"
          value="5"
          icon="⚡"
          color="var(--success)"
          sub="microsserviços online"
        />
      </div>

      {/* Fila de triagem */}
      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-800)' }}>Fila de Triagem</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/triagem')}>Ver todas →</button>
      </div>

      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando...</div>
      ) : triagens.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 600 }}>Nenhuma triagem aguardando</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Todos os pacientes estão sendo atendidos</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {triagens.map(t => (
            <div key={t.id} className="card" style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              borderLeft: `4px solid ${RISCO_COR[t.nivelRisco] || 'var(--gray-300)'}`,
            }}>
              <span style={{ fontSize: 22 }}>{RISCO_ICON[t.nivelRisco]}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span className={`badge risco-${t.nivelRisco}`}>{t.nivelRisco}</span>
                  <span style={{ fontWeight: 600 }}>Paciente #{t.idPaciente}</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.sintomas}
                </p>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>
                {new Date(t.dataTriagem).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
