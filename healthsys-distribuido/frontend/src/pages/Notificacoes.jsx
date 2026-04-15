import { useEffect, useState } from 'react'
import { notificacaoService } from '../services/api'

function decodeJwt() {
  try { return JSON.parse(atob(localStorage.getItem('token').split('.')[1])) } catch { return null }
}

const TIPO_LABEL = { GERAL: 'Geral', TRIAGEM: 'Triagem', CONSULTA: 'Consulta', ALERTA: 'Alerta' }
const TIPO_COR   = {
  GERAL:    { bg: 'var(--gray-100)',    color: 'var(--gray-600)',  border: 'var(--gray-200)' },
  TRIAGEM:  { bg: '#fef2f2',            color: 'var(--danger)',    border: '#fecaca' },
  CONSULTA: { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary-muted)' },
  ALERTA:   { bg: '#fffbeb',            color: 'var(--warning)',   border: '#fde68a' },
}
const TIPO_ICON = { GERAL: '🔔', TRIAGEM: '🚨', CONSULTA: '📋', ALERTA: '⚠️' }

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filtro, setFiltro]             = useState('TODAS') // TODAS | NAO_LIDAS
  const [marcando, setMarcando]         = useState(false)

  const payload    = decodeJwt()
  const idUsuario  = payload?.id || 1

  async function carregar() {
    setLoading(true)
    try {
      const { data } = await notificacaoService.listar(idUsuario)
      setNotificacoes(data || [])
    } catch {
      setNotificacoes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [])

  async function marcarLida(id) {
    await notificacaoService.marcarComoLida(id)
    setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n))
  }

  async function marcarTodas() {
    setMarcando(true)
    try {
      await notificacaoService.marcarTodasComoLidas(idUsuario)
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))
    } finally {
      setMarcando(false)
    }
  }

  const exibidas   = filtro === 'NAO_LIDAS'
    ? notificacoes.filter(n => !n.lida)
    : notificacoes
  const naoLidas   = notificacoes.filter(n => !n.lida).length

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notificações</h1>
          <p className="page-subtitle">
            {loading ? '...' : `${naoLidas} não lida${naoLidas !== 1 ? 's' : ''} · ${notificacoes.length} total`}
          </p>
        </div>
        {naoLidas > 0 && (
          <button className="btn btn-ghost" onClick={marcarTodas} disabled={marcando}>
            {marcando ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Marcando...</> : '✓ Marcar todas como lidas'}
          </button>
        )}
      </div>

      {/* Filtro */}
      <div className="tabs" style={{ marginBottom: 24 }}>
        <button className={`tab ${filtro === 'TODAS' ? 'tab-active' : ''}`} onClick={() => setFiltro('TODAS')}>
          Todas
          <span style={{ marginLeft: 6, background: 'var(--gray-100)', borderRadius: 99, padding: '1px 7px', fontSize: 12, fontWeight: 600 }}>
            {notificacoes.length}
          </span>
        </button>
        <button className={`tab ${filtro === 'NAO_LIDAS' ? 'tab-active' : ''}`} onClick={() => setFiltro('NAO_LIDAS')}>
          Não lidas
          {naoLidas > 0 && (
            <span style={{ marginLeft: 6, background: 'var(--danger)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {naoLidas}
            </span>
          )}
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="loading-block card"><span className="spinner" /> Carregando...</div>
      ) : exibidas.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--gray-400)' }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
          <div style={{ fontWeight: 600, color: 'var(--gray-600)' }}>
            {filtro === 'NAO_LIDAS' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            {filtro === 'NAO_LIDAS' ? 'Você está em dia!' : 'Notificações do sistema aparecerão aqui'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exibidas.map(n => {
            const cor = TIPO_COR[n.tipo] || TIPO_COR.GERAL
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  opacity: n.lida ? 0.65 : 1,
                  borderLeft: `4px solid ${cor.border}`,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: cor.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {TIPO_ICON[n.tipo] || '🔔'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: 14 }}>{n.titulo}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 99,
                      background: cor.bg, color: cor.color, border: `1px solid ${cor.border}`,
                    }}>
                      {TIPO_LABEL[n.tipo] || n.tipo}
                    </span>
                    {!n.lida && (
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'inline-block',
                      }} />
                    )}
                  </div>
                  {n.mensagem && (
                    <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '0 0 6px' }}>{n.mensagem}</p>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>
                    {n.dataEnvio
                      ? new Date(n.dataEnvio).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>

                {!n.lida && (
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ flexShrink: 0 }}
                    onClick={() => marcarLida(n.id)}
                  >
                    Marcar lida
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
