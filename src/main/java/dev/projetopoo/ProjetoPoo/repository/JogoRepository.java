package dev.projetopoo.ProjetoPoo.repository;


import dev.projetopoo.ProjetoPoo.model.Jogo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JogoRepository extends JpaRepository<Jogo, Long> {
    Optional<Jogo> findByNome(String nome);
}
