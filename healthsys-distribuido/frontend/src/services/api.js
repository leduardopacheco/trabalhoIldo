import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  registro: (dados) => api.post('/auth/registro', dados),
}

export const usuarioService = {
  listar: () => api.get('/usuarios'),
  buscar: (id) => api.get(`/usuarios/${id}`),
  desativar: (id) => api.delete(`/usuarios/${id}`),
}

export const pacienteService = {
  listar: (nome) => api.get('/pacientes', { params: nome ? { nome } : {} }),
  buscar: (id) => api.get(`/pacientes/${id}`),
  cadastrar: (dados) => api.post('/pacientes', dados),
  atualizar: (id, dados) => api.put(`/pacientes/${id}`, dados),
  listarVacinas: (id) => api.get(`/pacientes/${id}/vacinas`),
  registrarVacina: (id, dados) => api.post(`/pacientes/${id}/vacinas`, dados),
  listarAlergias: (id) => api.get(`/pacientes/${id}/alergias`),
  registrarAlergia: (id, dados) => api.post(`/pacientes/${id}/alergias`, dados),
  removerAlergia: (id, alergiaId) => api.delete(`/pacientes/${id}/alergias/${alergiaId}`),
}

export const prontuarioService = {
  buscarPorPaciente: (idPaciente) => api.get(`/prontuarios/paciente/${idPaciente}`),
  criar: (idPaciente) => api.post(`/prontuarios/paciente/${idPaciente}`),
  listarConsultas: (id) => api.get(`/prontuarios/${id}/consultas`),
  adicionarConsulta: (id, dados) => api.post(`/prontuarios/${id}/consultas`, dados),
  listarExames: (id) => api.get(`/prontuarios/${id}/exames`),
  adicionarExame: (id, dados) => api.post(`/prontuarios/${id}/exames`, dados),
  listarMedicamentos: (id) => api.get(`/prontuarios/${id}/medicamentos`),
  adicionarMedicamento: (id, idConsulta, dados) => api.post(`/prontuarios/${id}/consultas/${idConsulta}/medicamentos`, dados),
}

export const triagemService = {
  realizar: (dados) => api.post('/triagens', dados),
  listarAguardando: () => api.get('/triagens/aguardando'),
  listarEmAtendimento: () => api.get('/triagens/em-atendimento'),
  listarPorPaciente: (id) => api.get(`/triagens/paciente/${id}`),
  atualizarStatus: (id, status) => api.patch(`/triagens/${id}/status`, null, { params: { status } }),
}

export const notificacaoService = {
  listar: (idUsuario) => api.get(`/notificacoes/usuario/${idUsuario}`),
  contarNaoLidas: (idUsuario) => api.get(`/notificacoes/usuario/${idUsuario}/contagem`),
  marcarComoLida: (id) => api.patch(`/notificacoes/${id}/lida`),
  marcarTodasComoLidas: (idUsuario) => api.patch(`/notificacoes/usuario/${idUsuario}/marcar-todas-lidas`),
}

export default api
