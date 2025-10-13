package dev.projetopoo.ProjetoPoo.repository;

import dev.projetopoo.ProjetoPoo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
}
