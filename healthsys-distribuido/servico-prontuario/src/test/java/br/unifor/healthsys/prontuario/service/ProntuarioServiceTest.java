package br.unifor.healthsys.prontuario.service;

import br.unifor.healthsys.prontuario.model.Prontuario;
import br.unifor.healthsys.prontuario.repository.ProntuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProntuarioServiceTest {

    @Mock
    private ProntuarioRepository prontuarioRepository;

    @InjectMocks
    private ProntuarioService prontuarioService;

    private Prontuario prontuario;

    @BeforeEach
    void setUp() {
        prontuario = Prontuario.builder()
                .id(1L)
                .idPaciente(10L)
                .historicoClinico("Hipertensão")
                .build();
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornar() {
        when(prontuarioRepository.findById(1L)).thenReturn(Optional.of(prontuario));

        Prontuario resultado = prontuarioService.buscarPorId(1L);

        assertThat(resultado.getId()).isEqualTo(1L);
        assertThat(resultado.getIdPaciente()).isEqualTo(10L);
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancarException() {
        when(prontuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> prontuarioService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrado");
    }

    @Test
    void criarOuBuscar_quandoNaoExiste_deveCriarNovoProntuario() {
        when(prontuarioRepository.findByIdPaciente(10L)).thenReturn(Optional.empty());
        when(prontuarioRepository.save(any(Prontuario.class))).thenReturn(prontuario);

        Prontuario resultado = prontuarioService.criarOuBuscar(10L);

        assertThat(resultado).isNotNull();
        verify(prontuarioRepository).save(any(Prontuario.class));
    }

    @Test
    void criarOuBuscar_quandoJaExiste_deveRetornarExistente() {
        when(prontuarioRepository.findByIdPaciente(10L)).thenReturn(Optional.of(prontuario));

        Prontuario resultado = prontuarioService.criarOuBuscar(10L);

        assertThat(resultado.getId()).isEqualTo(1L);
        verify(prontuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_deveModificarCampos() {
        when(prontuarioRepository.findById(1L)).thenReturn(Optional.of(prontuario));
        when(prontuarioRepository.save(prontuario)).thenReturn(prontuario);

        Prontuario resultado = prontuarioService.atualizar(1L, "Diabetes tipo 2", "Paciente controlado");

        assertThat(resultado.getHistoricoClinico()).isEqualTo("Diabetes tipo 2");
        assertThat(resultado.getObservacoesGerais()).isEqualTo("Paciente controlado");
    }
}
