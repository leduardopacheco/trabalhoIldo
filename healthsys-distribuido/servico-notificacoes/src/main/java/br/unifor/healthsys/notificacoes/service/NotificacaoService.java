package br.unifor.healthsys.notificacoes.service;

import br.unifor.healthsys.notificacoes.model.Notificacao;
import br.unifor.healthsys.notificacoes.repository.NotificacaoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final ObjectMapper objectMapper;

    // ─── Kafka Consumer ───────────────────────────────────
    @KafkaListener(topics = "triagem-eventos", groupId = "notificacoes-group")
    public void consumirEventoTriagem(String mensagem) {
        try {
            JsonNode evento = objectMapper.readTree(mensagem);
            String nivelRisco = evento.get("nivelRisco").asText();
            Long idPaciente = evento.get("idPaciente").asLong();

            String titulo = String.format("Nova triagem – Risco %s", nivelRisco);
            String corpo  = String.format("Paciente %d foi triado com nível de risco %s.", idPaciente, nivelRisco);

            // Notifica todos os profissionais de saúde (ID 1 como exemplo – adaptar conforme regra real)
            criar(Notificacao.builder()
                    .idUsuario(1L)
                    .titulo(titulo)
                    .mensagem(corpo)
                    .tipo(Notificacao.TipoNotificacao.TRIAGEM)
                    .status(Notificacao.StatusNotificacao.ENVIADA)
                    .build());

            log.info("Notificação criada a partir do evento de triagem: {}", mensagem);
        } catch (Exception e) {
            log.error("Erro ao processar evento de triagem: {}", e.getMessage());
        }
    }

    // ─── CRUD ─────────────────────────────────────────────
    @Transactional
    public Notificacao criar(Notificacao notificacao) {
        return notificacaoRepository.save(notificacao);
    }

    @Transactional(readOnly = true)
    public List<Notificacao> listarPorUsuario(Long idUsuario) {
        return notificacaoRepository.findByIdUsuarioOrderByDataEnvioDesc(idUsuario);
    }

    @Transactional(readOnly = true)
    public List<Notificacao> listarNaoLidas(Long idUsuario) {
        return notificacaoRepository.findByIdUsuarioAndLidaFalseOrderByDataEnvioDesc(idUsuario);
    }

    @Transactional(readOnly = true)
    public long contarNaoLidas(Long idUsuario) {
        return notificacaoRepository.countByIdUsuarioAndLidaFalse(idUsuario);
    }

    @Transactional
    public Notificacao marcarComoLida(Long id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada: " + id));
        notificacao.setLida(true);
        notificacao.setStatus(Notificacao.StatusNotificacao.LIDA);
        return notificacaoRepository.save(notificacao);
    }

    @Transactional
    public void marcarTodasComoLidas(Long idUsuario) {
        List<Notificacao> naoLidas = listarNaoLidas(idUsuario);
        naoLidas.forEach(n -> {
            n.setLida(true);
            n.setStatus(Notificacao.StatusNotificacao.LIDA);
        });
        notificacaoRepository.saveAll(naoLidas);
    }
}
