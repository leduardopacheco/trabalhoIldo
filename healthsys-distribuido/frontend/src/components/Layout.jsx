import { Outlet, NavLink, useNavigate } from 'react-router-dom'

function decodeJwt() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    return JSON.parse(atob(token.split('.')[1]))
  } catch { return null }
}

const NAV = [
  { to: '/',                 label: 'Dashboard',    icon: '▦',  end: true },
  { to: '/pacientes',        label: 'Pacientes',    icon: '👤' },
  { to: '/triagem',          label: 'Triagem',      icon: '🚨' },
  { to: '/prontuario-lista', label: 'Prontuários',  icon: '📋' },
  { to: '/notificacoes',     label: 'Notificações', icon: '🔔' },
  { to: '/usuarios',         label: 'Usuários',     icon: '👥' },
]

export default function Layout() {
  const navigate  = useNavigate()
  const payload   = decodeJwt()
  const initials  = payload?.sub ? payload.sub[0].toUpperCase() : 'U'

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 'var(--sidebar-w)',
        background: 'var(--gray-900)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>H</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>HealthSys</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Distribuído</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              textDecoration: 'none',
              transition: 'background .15s',
              background: isActive ? 'rgba(37,99,235,.35)' : 'transparent',
              color: isActive ? '#fff' : 'rgba(255,255,255,.55)',
            })}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 6 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>{initials}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {payload?.sub || 'Usuário'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Online</div>
            </div>
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm btn-block" style={{ color: 'rgba(255,255,255,.5)', borderColor: 'rgba(255,255,255,.12)' }}>
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, padding: '32px 36px', background: 'var(--gray-50)' }}>
        <Outlet />
      </main>
    </div>
  )
}
