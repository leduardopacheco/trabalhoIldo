package br.unifor.healthsys.triagem.repository;

import br.unifor.healthsys.triagem.model.Triagem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TriagemRepository extends JpaRepository<Triagem, Long> {

    List<Triagem> findByIdPacienteOrderByDataTriagemDesc(Long idPaciente);

    List<Triagem> findByNivelRiscoOrderByDataTriagemAsc(Triagem.NivelRisco nivelRisco);

    List<Triagem> findByStatusOrderByDataTriagemAsc(Triagem.StatusTriagem status);
}
