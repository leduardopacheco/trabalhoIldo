package br.unifor.healthsys.prontuario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "exames")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Exame {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prontuario", nullable = false)
    private Prontuario prontuario;

    @NotBlank
    @Column(name = "tipo_exame", nullable = false, length = 100)
    private String tipoExame;

    @Builder.Default
    @Column(name = "data_exame", nullable = false)
    private LocalDateTime dataExame = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String resultado;

    @Column(name = "arquivo_url", length = 500)
    private String arquivoUrl;
}
