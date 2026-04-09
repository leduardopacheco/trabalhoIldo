package br.unifor.healthsys.triagem.repository;

import br.unifor.healthsys.triagem.model.Atendimento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AtendimentoRepository extends JpaRepository<Atendimento, Long> {

    List<Atendimento> findByIdPacienteOrderByDataDesc(Long idPaciente);

    List<Atendimento> findByStatusOrderByDataAsc(Atendimento.StatusAtendimento status);
}
