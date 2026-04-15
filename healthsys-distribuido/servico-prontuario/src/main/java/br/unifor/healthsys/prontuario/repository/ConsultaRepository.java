package br.unifor.healthsys.prontuario.repository;

import br.unifor.healthsys.prontuario.model.Consulta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsultaRepository extends JpaRepository<Consulta, Long> {
}
