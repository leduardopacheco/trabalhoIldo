package br.unifor.healthsys.triagem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "atendimentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Atendimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "id_paciente", nullable = false)
    private Long idPaciente;

    @Column(name = "id_prontuario")
    private Long idProntuario;

    @NotNull
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_atendimento", nullable = false, length = 50)
    private TipoAtendimento tipoAtendimento;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusAtendimento status = StatusAtendimento.ABERTO;

    public enum TipoAtendimento {
        CONSULTA, EMERGENCIA, RETORNO, TELETRIAGEM
    }

    public enum StatusAtendimento {
        ABERTO, EM_ANDAMENTO, ENCERRADO
    }
}
