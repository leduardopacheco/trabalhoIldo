import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

export default function Login() {
  const [email, setEmail]         = useState('')
  const [senha, setSenha]         = useState('')
  const [erro, setErro]           = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const { data } = await authService.login(email, senha)
      localStorage.setItem('token', data.token)
      navigate('/')
    } catch {
      setErro('E-mail ou senha inválidos. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #1e293b 0%, #1d4ed8 100%)',
    }}>
      {/* Painel esquerdo — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 80px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, fontWeight: 800,
          }}>H</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>HealthSys</div>
            <div style={{ fontSize: 13, opacity: .6 }}>Distribuído · UNIFOR</div>
          </div>
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 }}>
          Plataforma de<br />Gestão Hospitalar
        </h1>
        <p style={{ fontSize: 16, opacity: .7, maxWidth: 380, lineHeight: 1.7 }}>
          Sistema distribuído de prontuários, triagem e gestão de pacientes para unidades de saúde.
        </p>

        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            ['🔒', 'Autenticação segura com JWT'],
            ['⚡', 'Teletriagem com Protocolo de Manchester'],
            ['📋', 'Prontuário eletrônico integrado'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: .8 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div style={{
        width: 460,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        background: 'rgba(255,255,255,.04)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="card" style={{ width: '100%', padding: 40 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 6 }}>
              Entrar no sistema
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              Use suas credenciais institucionais
            </p>
          </div>

          {erro && (
            <div className="alert alert-error">
              <span>⚠️</span> {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                className="form-input"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={carregando}
              style={{ marginTop: 8 }}
            >
              {carregando ? <><span className="spinner" style={{ width:16, height:16 }} /> Entrando...</> : 'Entrar'}
            </button>
          </form>

          <p style={{ marginTop: 24, fontSize: 12, color: 'var(--gray-400)', textAlign: 'center' }}>
            Credenciais padrão: <strong>admin@healthsys.com</strong> / <strong>senha123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
