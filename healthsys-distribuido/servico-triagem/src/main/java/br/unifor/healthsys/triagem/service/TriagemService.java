package br.unifor.healthsys.triagem.service;

import br.unifor.healthsys.triagem.model.Atendimento;
import br.unifor.healthsys.triagem.model.Triagem;
import br.unifor.healthsys.triagem.repository.AtendimentoRepository;
import br.unifor.healthsys.triagem.repository.TriagemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TriagemService {

    private static final String TOPIC_TRIAGEM = "triagem-eventos";

    private final TriagemRepository triagemRepository;
    private final AtendimentoRepository atendimentoRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Transactional
    public Triagem realizarTriagem(Triagem triagem) {
        Triagem salva = triagemRepository.save(triagem);

        // Publica evento no Kafka para outros serviços (ex: notificações)
        String evento = String.format(
                "{\"tipo\":\"NOVA_TRIAGEM\",\"idTriagem\":%d,\"idPaciente\":%d,\"nivelRisco\":\"%s\"}",
                salva.getId(), salva.getIdPaciente(), salva.getNivelRisco()
        );
        kafkaTemplate.send(TOPIC_TRIAGEM, evento);
        log.info("Triagem {} publicada no Kafka. Nível de risco: {}", salva.getId(), salva.getNivelRisco());

        return salva;
    }

    @Transactional
    public Triagem atualizarStatus(Long id, Triagem.StatusTriagem novoStatus) {
        Triagem triagem = buscarPorId(id);
        triagem.setStatus(novoStatus);
        return triagemRepository.save(triagem);
    }

    @Transactional(readOnly = true)
    public Triagem buscarPorId(Long id) {
        return triagemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Triagem não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<Triagem> listarPorPaciente(Long idPaciente) {
        return triagemRepository.findByIdPacienteOrderByDataTriagemDesc(idPaciente);
    }

    @Transactional(readOnly = true)
    public List<Triagem> listarAguardando() {
        return triagemRepository.findByStatusOrderByDataTriagemAsc(Triagem.StatusTriagem.AGUARDANDO);
    }

    @Transactional
    public Atendimento abrirAtendimento(Atendimento atendimento) {
        return atendimentoRepository.save(atendimento);
    }

    @Transactional(readOnly = true)
    public List<Atendimento> listarAtendimentosPorPaciente(Long idPaciente) {
        return atendimentoRepository.findByIdPacienteOrderByDataDesc(idPaciente);
    }

    @Transactional
    public Atendimento encerrarAtendimento(Long id) {
        Atendimento atendimento = atendimentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Atendimento não encontrado: " + id));
        atendimento.setStatus(Atendimento.StatusAtendimento.ENCERRADO);
        return atendimentoRepository.save(atendimento);
    }
}
