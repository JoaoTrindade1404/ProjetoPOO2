package dev.projetopoo.ProjetoPoo.repository;

import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BibliotecaRepository extends JpaRepository<Biblioteca, Long> {
    Optional<Biblioteca> findByUsuarioId(Long usuarioId);
}
