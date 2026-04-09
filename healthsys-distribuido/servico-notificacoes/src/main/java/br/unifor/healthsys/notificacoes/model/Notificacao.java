package br.unifor.healthsys.notificacoes.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private TipoNotificacao tipo = TipoNotificacao.GERAL;

    @Builder.Default
    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private Boolean lida = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusNotificacao status = StatusNotificacao.PENDENTE;

    public enum TipoNotificacao {
        GERAL, TRIAGEM, CONSULTA, ALERTA
    }

    public enum StatusNotificacao {
        PENDENTE, ENVIADA, LIDA
    }
}
