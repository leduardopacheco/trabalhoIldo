package br.unifor.healthsys.triagem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "triagens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Triagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @NotNull
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "id_atendimento")
    private Long idAtendimento;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String sintomas;

    @Enumerated(EnumType.STRING)
    @Column(name = "nivel_risco", nullable = false, length = 20)
    private NivelRisco nivelRisco;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusTriagem status = StatusTriagem.AGUARDANDO;

    @Builder.Default
    @Column(name = "data_triagem", nullable = false)
    private LocalDateTime dataTriagem = LocalDateTime.now();

    public enum NivelRisco {
        VERMELHO,   // emergência
        LARANJA,    // muito urgente
        AMARELO,    // urgente
        VERDE,      // pouco urgente
        AZUL        // não urgente
    }

    public enum StatusTriagem {
        AGUARDANDO,
        EM_ATENDIMENTO,
        CONCLUIDA
    }
}
