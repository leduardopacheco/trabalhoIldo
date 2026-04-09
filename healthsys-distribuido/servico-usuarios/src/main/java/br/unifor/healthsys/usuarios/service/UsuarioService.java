package br.unifor.healthsys.usuarios.service;

import br.unifor.healthsys.usuarios.dto.RegistroDTO;
import br.unifor.healthsys.usuarios.dto.UsuarioResponseDTO;
import br.unifor.healthsys.usuarios.model.Usuario;
import br.unifor.healthsys.usuarios.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(Long id) {
        return UsuarioResponseDTO.from(findOrThrow(id));
    }

    @Transactional
    public UsuarioResponseDTO criar(RegistroDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new RuntimeException("E-mail já cadastrado: " + dto.email());
        }
        Usuario usuario = Usuario.builder()
                .nome(dto.nome())
                .perfil(dto.perfil())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha()))
                .build();
        return UsuarioResponseDTO.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponseDTO atualizar(Long id, UsuarioResponseDTO dados) {
        Usuario usuario = findOrThrow(id);
        if (dados.nome() != null) usuario.setNome(dados.nome());
        if (dados.perfil() != null) usuario.setPerfil(dados.perfil());
        return UsuarioResponseDTO.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public void desativar(Long id) {
        Usuario usuario = findOrThrow(id);
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    // Used internally by Spring Security
    public Usuario findEntityByEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + email));
    }

    private Usuario findOrThrow(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + id));
    }
}
