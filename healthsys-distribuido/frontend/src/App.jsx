import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Pacientes from './pages/Pacientes'
import Triagem from './pages/Triagem'
import ProntuarioLista from './pages/ProntuarioLista'
import Prontuario from './pages/Prontuario'
import Notificacoes from './pages/Notificacoes'
import Usuarios from './pages/Usuarios'
import Login from './pages/Login'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pacientes" element={<Pacientes />} />
          <Route path="triagem" element={<Triagem />} />
          <Route path="prontuario-lista" element={<ProntuarioLista />} />
          <Route path="prontuario/:id" element={<Prontuario />} />
          <Route path="notificacoes" element={<Notificacoes />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
