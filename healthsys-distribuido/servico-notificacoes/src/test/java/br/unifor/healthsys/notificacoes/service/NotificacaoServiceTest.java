package br.unifor.healthsys.notificacoes.service;

import br.unifor.healthsys.notificacoes.model.Notificacao;
import br.unifor.healthsys.notificacoes.model.Notificacao.TipoNotificacao;
import br.unifor.healthsys.notificacoes.model.Notificacao.StatusNotificacao;
import br.unifor.healthsys.notificacoes.repository.NotificacaoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificacaoServiceTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private NotificacaoService notificacaoService;

    private Notificacao notificacao;

    @BeforeEach
    void setUp() {
        notificacao = Notificacao.builder()
                .id(1L)
                .idUsuario(1L)
                .titulo("Triagem VERMELHO")
                .mensagem("Paciente em emergência")
                .tipo(TipoNotificacao.TRIAGEM)
                .status(StatusNotificacao.ENVIADA)
                .lida(false)
                .build();
    }

    @Test
    void criar_deveSalvarNotificacao() {
        when(notificacaoRepository.save(notificacao)).thenReturn(notificacao);

        Notificacao resultado = notificacaoService.criar(notificacao);

        assertThat(resultado.getTitulo()).isEqualTo("Triagem VERMELHO");
        verify(notificacaoRepository).save(notificacao);
    }

    @Test
    void listarPorUsuario_deveRetornarNotificacoesDoUsuario() {
        when(notificacaoRepository.findByIdUsuarioOrderByDataEnvioDesc(1L))
                .thenReturn(List.of(notificacao));

        List<Notificacao> resultado = notificacaoService.listarPorUsuario(1L);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getIdUsuario()).isEqualTo(1L);
    }

    @Test
    void contarNaoLidas_deveRetornarContagem() {
        when(notificacaoRepository.countByIdUsuarioAndLidaFalse(1L)).thenReturn(3L);

        long total = notificacaoService.contarNaoLidas(1L);

        assertThat(total).isEqualTo(3L);
    }

    @Test
    void marcarComoLida_deveAtualizarStatus() {
        when(notificacaoRepository.findById(1L)).thenReturn(Optional.of(notificacao));
        when(notificacaoRepository.save(notificacao)).thenReturn(notificacao);

        Notificacao resultado = notificacaoService.marcarComoLida(1L);

        assertThat(resultado.getLida()).isTrue();
        assertThat(resultado.getStatus()).isEqualTo(StatusNotificacao.LIDA);
    }

    @Test
    void marcarComoLida_quandoNaoEncontrada_deveLancarException() {
        when(notificacaoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificacaoService.marcarComoLida(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrada");
    }
}
