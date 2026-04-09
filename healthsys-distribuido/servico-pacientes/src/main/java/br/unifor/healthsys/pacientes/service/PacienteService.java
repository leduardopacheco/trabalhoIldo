package br.unifor.healthsys.pacientes.service;

import br.unifor.healthsys.pacientes.model.Alergia;
import br.unifor.healthsys.pacientes.model.Paciente;
import br.unifor.healthsys.pacientes.model.Vacina;
import br.unifor.healthsys.pacientes.repository.AlergiaRepository;
import br.unifor.healthsys.pacientes.repository.PacienteRepository;
import br.unifor.healthsys.pacientes.repository.VacinaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final VacinaRepository vacinaRepository;
    private final AlergiaRepository alergiaRepository;

    @Transactional(readOnly = true)
    public List<Paciente> listarTodos() {
        return pacienteRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Paciente buscarPorId(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paciente não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Paciente> buscarPorNome(String nome) {
        return pacienteRepository.findByNomeContainingIgnoreCase(nome);
    }

    @Transactional
    public Paciente cadastrar(Paciente paciente) {
        if (paciente.getCpf() != null && pacienteRepository.existsByCpf(paciente.getCpf())) {
            throw new RuntimeException("CPF já cadastrado: " + paciente.getCpf());
        }
        return pacienteRepository.save(paciente);
    }

    @Transactional
    public Paciente atualizar(Long id, Paciente dados) {
        Paciente paciente = buscarPorId(id);
        paciente.setNome(dados.getNome());
        paciente.setDataNascimento(dados.getDataNascimento());
        paciente.setSexo(dados.getSexo());
        paciente.setTelefone(dados.getTelefone());
        paciente.setEmail(dados.getEmail());
        paciente.setEndereco(dados.getEndereco());
        return pacienteRepository.save(paciente);
    }

    @Transactional
    public Vacina registrarVacina(Long pacienteId, Vacina vacina) {
        Paciente paciente = buscarPorId(pacienteId);
        vacina.setPaciente(paciente);
        return vacinaRepository.save(vacina);
    }

    @Transactional(readOnly = true)
    public List<Vacina> listarVacinas(Long pacienteId) {
        return vacinaRepository.findByPacienteId(pacienteId);
    }

    @Transactional
    public Alergia registrarAlergia(Long pacienteId, Alergia alergia) {
        Paciente paciente = buscarPorId(pacienteId);
        alergia.setPaciente(paciente);
        return alergiaRepository.save(alergia);
    }

    @Transactional(readOnly = true)
    public List<Alergia> listarAlergias(Long pacienteId) {
        buscarPorId(pacienteId); // valida existência
        return alergiaRepository.findByPacienteId(pacienteId);
    }

    @Transactional
    public void removerAlergia(Long pacienteId, Long alergiaId) {
        Alergia alergia = alergiaRepository.findById(alergiaId)
                .orElseThrow(() -> new RuntimeException("Alergia não encontrada: " + alergiaId));
        if (!alergia.getPaciente().getId().equals(pacienteId)) {
            throw new RuntimeException("Alergia não pertence ao paciente informado");
        }
        alergiaRepository.delete(alergia);
    }
}
