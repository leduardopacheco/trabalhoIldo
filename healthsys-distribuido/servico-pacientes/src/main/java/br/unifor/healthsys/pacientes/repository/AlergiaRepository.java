package br.unifor.healthsys.pacientes.repository;

import br.unifor.healthsys.pacientes.model.Alergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Long> {
    List<Alergia> findByPacienteId(Long pacienteId);
}
