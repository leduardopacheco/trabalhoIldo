package br.unifor.healthsys.usuarios.dto;

import br.unifor.healthsys.usuarios.model.PerfilUsuario;
import br.unifor.healthsys.usuarios.model.Usuario;

import java.time.LocalDateTime;

public record UsuarioResponseDTO(
        Long id,
        String nome,
        PerfilUsuario perfil,
        String email,
        Boolean ativo,
        LocalDateTime createdAt
) {
    public static UsuarioResponseDTO from(Usuario u) {
        return new UsuarioResponseDTO(u.getId(), u.getNome(), u.getPerfil(),
                u.getEmail(), u.getAtivo(), u.getCreatedAt());
    }
}
