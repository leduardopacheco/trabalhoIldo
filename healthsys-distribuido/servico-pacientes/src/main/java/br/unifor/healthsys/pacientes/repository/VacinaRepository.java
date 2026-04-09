package br.unifor.healthsys.pacientes.repository;

import br.unifor.healthsys.pacientes.model.Vacina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VacinaRepository extends JpaRepository<Vacina, Long> {

    List<Vacina> findByPacienteId(Long pacienteId);
}
