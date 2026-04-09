import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const navStyle = { textDecoration: 'none', color: '#555', padding: '8px 16px', borderRadius: 4, display: 'block' }
const activeStyle = { ...navStyle, background: '#0066cc', color: '#fff' }

function decodeJwtNome() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.sub || null
  } catch {
    return null
  }
}

export default function Layout() {
  const navigate = useNavigate()
  const usuarioEmail = decodeJwtNome()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: '#f4f4f4', padding: 24, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8, color: '#0066cc' }}>
          HealthSys
        </div>
        {usuarioEmail && (
          <div style={{ fontSize: 12, color: '#888', marginBottom: 20, wordBreak: 'break-word' }}>
            {usuarioEmail}
          </div>
        )}
        <NavLink to="/" end style={({ isActive }) => isActive ? activeStyle : navStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/pacientes" style={({ isActive }) => isActive ? activeStyle : navStyle}>
          Pacientes
        </NavLink>
        <NavLink to="/triagem" style={({ isActive }) => isActive ? activeStyle : navStyle}>
          Triagem
        </NavLink>
        <NavLink to="/usuarios" style={({ isActive }) => isActive ? activeStyle : navStyle}>
          Usuários
        </NavLink>
        <div style={{ flex: 1 }} />
        <button
          onClick={logout}
          style={{ background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '8px 16px', cursor: 'pointer', color: '#555' }}
        >
          Sair
        </button>
      </nav>

      {/* Conteúdo */}
      <main style={{ flex: 1, padding: 32, background: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  )
}
