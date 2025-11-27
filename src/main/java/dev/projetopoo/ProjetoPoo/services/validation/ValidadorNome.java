package dev.projetopoo.ProjetoPoo.services.validation;

import org.springframework.stereotype.Component;
import dev.projetopoo.ProjetoPoo.model.Jogo;

@Component
public class ValidadorNome implements ValidadorJogo {
    @Override
    public void validar(Jogo jogo) {
        if (jogo.getNome() == null || jogo.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do jogo é obrigatório");
        }
    }
}
