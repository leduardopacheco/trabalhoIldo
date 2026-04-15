package br.unifor.healthsys.pacientes.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "vacinas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Vacina {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_paciente", nullable = false)
    private Paciente paciente;

    @NotBlank
    @Column(name = "nome_vacina", nullable = false, length = 100)
    private String nomeVacina;

    @NotNull
    @Column(name = "data_aplicacao", nullable = false)
    private LocalDate dataAplicacao;

    @Column(length = 50)
    private String lote;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}
