package br.unifor.healthsys.triagem.service;

import br.unifor.healthsys.triagem.model.Triagem;
import br.unifor.healthsys.triagem.model.Triagem.NivelRisco;
import br.unifor.healthsys.triagem.model.Triagem.StatusTriagem;
import br.unifor.healthsys.triagem.repository.AtendimentoRepository;
import br.unifor.healthsys.triagem.repository.TriagemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TriagemServiceTest {

    @Mock
    private TriagemRepository triagemRepository;
    @Mock
    private AtendimentoRepository atendimentoRepository;
    @Mock
    private KafkaTemplate<String, String> kafkaTemplate;

    @InjectMocks
    private TriagemService triagemService;

    private Triagem triagem;

    @BeforeEach
    void setUp() {
        triagem = Triagem.builder()
                .id(1L)
                .idPaciente(10L)
                .idUsuario(2L)
                .sintomas("Febre e dor de cabeça")
                .nivelRisco(NivelRisco.AMARELO)
                .status(StatusTriagem.AGUARDANDO)
                .build();
    }

    @Test
    void realizarTriagem_deveSalvarEPublicarKafka() {
        when(triagemRepository.save(any(Triagem.class))).thenReturn(triagem);

        Triagem resultado = triagemService.realizarTriagem(triagem);

        assertThat(resultado.getId()).isEqualTo(1L);
        assertThat(resultado.getNivelRisco()).isEqualTo(NivelRisco.AMARELO);
        verify(triagemRepository).save(triagem);
        verify(kafkaTemplate).send(eq("triagem-eventos"), anyString());
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornar() {
        when(triagemRepository.findById(1L)).thenReturn(Optional.of(triagem));

        Triagem resultado = triagemService.buscarPorId(1L);

        assertThat(resultado.getIdPaciente()).isEqualTo(10L);
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancarException() {
        when(triagemRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> triagemService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrada");
    }

    @Test
    void atualizarStatus_deveAlterarStatus() {
        when(triagemRepository.findById(1L)).thenReturn(Optional.of(triagem));
        when(triagemRepository.save(triagem)).thenReturn(triagem);

        Triagem resultado = triagemService.atualizarStatus(1L, StatusTriagem.EM_ATENDIMENTO);

        assertThat(resultado.getStatus()).isEqualTo(StatusTriagem.EM_ATENDIMENTO);
    }

    @Test
    void listarAguardando_deveRetornarApenasPendentes() {
        when(triagemRepository.findByStatusOrderByDataTriagemAsc(StatusTriagem.AGUARDANDO))
                .thenReturn(List.of(triagem));

        List<Triagem> resultado = triagemService.listarAguardando();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getStatus()).isEqualTo(StatusTriagem.AGUARDANDO);
    }
}
