package br.unifor.healthsys.prontuario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "consultas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prontuario", nullable = false)
    private Prontuario prontuario;

    @NotNull
    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Builder.Default
    @Column(name = "data_consulta", nullable = false)
    private LocalDateTime dataConsulta = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(columnDefinition = "TEXT")
    private String conduta;

    @Column(length = 255)
    private String diagnostico;

    @OneToMany(mappedBy = "consulta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Medicamento> medicamentos = new ArrayList<>();
}
