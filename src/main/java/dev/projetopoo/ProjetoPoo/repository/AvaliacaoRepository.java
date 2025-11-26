package dev.projetopoo.ProjetoPoo.repository;

import dev.projetopoo.ProjetoPoo.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    Optional<Avaliacao> findByUsuarioIdAndJogoId(Long usuarioId, Long jogoId);
    List<Avaliacao> findByJogoId(Long jogoId);
}
