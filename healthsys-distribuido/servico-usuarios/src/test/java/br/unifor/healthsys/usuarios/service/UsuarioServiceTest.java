package br.unifor.healthsys.usuarios.service;

import br.unifor.healthsys.usuarios.dto.RegistroDTO;
import br.unifor.healthsys.usuarios.dto.UsuarioResponseDTO;
import br.unifor.healthsys.usuarios.model.PerfilUsuario;
import br.unifor.healthsys.usuarios.model.Usuario;
import br.unifor.healthsys.usuarios.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService usuarioService;

    private Usuario usuario;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nome("Dr. João")
                .perfil(PerfilUsuario.PROFISSIONAL_SAUDE)
                .email("joao@healthsys.com")
                .senha("$2a$10$hash")
                .ativo(true)
                .build();
    }

    @Test
    void listarTodos_deveRetornarListaDeUsuariosDTO() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<UsuarioResponseDTO> resultado = usuarioService.listarTodos();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).email()).isEqualTo("joao@healthsys.com");
        assertThat(resultado.get(0).nome()).isEqualTo("Dr. João");
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornarDTO() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        UsuarioResponseDTO resultado = usuarioService.buscarPorId(1L);

        assertThat(resultado.id()).isEqualTo(1L);
        assertThat(resultado.email()).isEqualTo("joao@healthsys.com");
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancarException() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> usuarioService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrado");
    }

    @Test
    void criar_quandoEmailNovoo_deveSalvarComSenhaCriptografada() {
        RegistroDTO dto = new RegistroDTO("Maria", PerfilUsuario.ATENDENTE,
                "maria@healthsys.com", "senha123");

        when(usuarioRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$encodedHash");
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        UsuarioResponseDTO resultado = usuarioService.criar(dto);

        assertThat(resultado).isNotNull();
        verify(passwordEncoder).encode("senha123");
        verify(usuarioRepository).save(any(Usuario.class));
    }

    @Test
    void criar_quandoEmailJaCadastrado_deveLancarException() {
        RegistroDTO dto = new RegistroDTO("Maria", PerfilUsuario.ATENDENTE,
                "joao@healthsys.com", "senha123");

        when(usuarioRepository.existsByEmail("joao@healthsys.com")).thenReturn(true);

        assertThatThrownBy(() -> usuarioService.criar(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("E-mail já cadastrado");
    }

    @Test
    void desativar_deveSetarAtivoFalso() {
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(usuario);

        usuarioService.desativar(1L);

        assertThat(usuario.getAtivo()).isFalse();
        verify(usuarioRepository).save(usuario);
    }
}
