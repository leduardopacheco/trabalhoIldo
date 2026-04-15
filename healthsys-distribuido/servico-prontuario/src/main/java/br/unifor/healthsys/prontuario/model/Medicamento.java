package br.unifor.healthsys.prontuario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medicamentos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_consulta", nullable = false)
    private Consulta consulta;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String nome;

    @Column(length = 50)
    private String dosagem;

    @Column(length = 50)
    private String frequencia;

    @Column(length = 50)
    private String duracao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}
