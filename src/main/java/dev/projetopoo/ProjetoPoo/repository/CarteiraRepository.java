package dev.projetopoo.ProjetoPoo.repository;

import dev.projetopoo.ProjetoPoo.model.Carteira;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarteiraRepository extends JpaRepository<Carteira, Long> {
    Optional<Carteira> findByUsuarioId(Long usuarioId);
}
