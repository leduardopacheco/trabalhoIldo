package br.unifor.healthsys.prontuario.service;

import br.unifor.healthsys.prontuario.model.*;
import br.unifor.healthsys.prontuario.repository.ConsultaRepository;
import br.unifor.healthsys.prontuario.repository.ProntuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProntuarioService {

    private final ProntuarioRepository prontuarioRepository;
    private final ConsultaRepository consultaRepository;

    @Transactional
    public Prontuario criarOuBuscar(Long idPaciente) {
        return prontuarioRepository.findByIdPaciente(idPaciente)
                .orElseGet(() -> prontuarioRepository.save(
                        Prontuario.builder().idPaciente(idPaciente).build()
                ));
    }

    @Transactional(readOnly = true)
    public Prontuario buscarPorPaciente(Long idPaciente) {
        return prontuarioRepository.findByIdPaciente(idPaciente)
                .orElseThrow(() -> new RuntimeException("Prontuário não encontrado para paciente: " + idPaciente));
    }

    @Transactional(readOnly = true)
    public Prontuario buscarPorId(Long id) {
        return prontuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prontuário não encontrado: " + id));
    }

    @Transactional
    public Prontuario atualizar(Long id, String historicoClinico, String observacoesGerais) {
        Prontuario prontuario = buscarPorId(id);
        prontuario.setHistoricoClinico(historicoClinico);
        prontuario.setObservacoesGerais(observacoesGerais);
        return prontuarioRepository.save(prontuario);
    }

    @Transactional
    public Consulta adicionarConsulta(Long idProntuario, Consulta consulta) {
        Prontuario prontuario = buscarPorId(idProntuario);
        consulta.setProntuario(prontuario);
        prontuario.getConsultas().add(consulta);
        prontuarioRepository.save(prontuario);
        return consulta;
    }

    @Transactional
    public Exame adicionarExame(Long idProntuario, Exame exame) {
        Prontuario prontuario = buscarPorId(idProntuario);
        exame.setProntuario(prontuario);
        prontuario.getExames().add(exame);
        prontuarioRepository.save(prontuario);
        return exame;
    }

    @Transactional(readOnly = true)
    public List<Consulta> listarConsultas(Long idProntuario) {
        return buscarPorId(idProntuario).getConsultas();
    }

    @Transactional(readOnly = true)
    public List<Exame> listarExames(Long idProntuario) {
        return buscarPorId(idProntuario).getExames();
    }

    @Transactional(readOnly = true)
    public List<Medicamento> listarMedicamentos(Long idProntuario) {
        return buscarPorId(idProntuario).getConsultas().stream()
                .flatMap(c -> c.getMedicamentos().stream())
                .collect(Collectors.toList());
    }

    @Transactional
    public Medicamento adicionarMedicamento(Long idProntuario, Long idConsulta, Medicamento medicamento) {
        Consulta consulta = consultaRepository.findById(idConsulta)
                .orElseThrow(() -> new RuntimeException("Consulta não encontrada: " + idConsulta));
        medicamento.setConsulta(consulta);
        consulta.getMedicamentos().add(medicamento);
        consultaRepository.save(consulta);
        return medicamento;
    }
}
