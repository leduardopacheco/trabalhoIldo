package br.unifor.healthsys.notificacoes.repository;

import br.unifor.healthsys.notificacoes.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {

    List<Notificacao> findByIdUsuarioOrderByDataEnvioDesc(Long idUsuario);

    List<Notificacao> findByIdUsuarioAndLidaFalseOrderByDataEnvioDesc(Long idUsuario);

    long countByIdUsuarioAndLidaFalse(Long idUsuario);
}
