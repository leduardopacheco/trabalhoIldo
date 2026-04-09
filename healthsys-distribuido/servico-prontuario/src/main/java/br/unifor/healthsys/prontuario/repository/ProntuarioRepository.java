package br.unifor.healthsys.prontuario.repository;

import br.unifor.healthsys.prontuario.model.Prontuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProntuarioRepository extends JpaRepository<Prontuario, Long> {

    Optional<Prontuario> findByIdPaciente(Long idPaciente);
}
