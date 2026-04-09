package br.unifor.healthsys.usuarios.dto;

import br.unifor.healthsys.usuarios.model.PerfilUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegistroDTO(
        @NotBlank(message = "Nome é obrigatório")
        String nome,

        @NotNull(message = "Perfil é obrigatório")
        PerfilUsuario perfil,

        @Email(message = "E-mail inválido")
        @NotBlank(message = "E-mail é obrigatório")
        String email,

        @NotBlank(message = "Senha é obrigatória")
        @Size(min = 6, message = "Senha deve ter ao menos 6 caracteres")
        String senha
) {}
