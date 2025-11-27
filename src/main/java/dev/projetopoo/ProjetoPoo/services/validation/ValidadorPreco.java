package dev.projetopoo.ProjetoPoo.services.validation;

import org.springframework.stereotype.Component;
import dev.projetopoo.ProjetoPoo.model.Jogo;

@Component
public class ValidadorPreco implements ValidadorJogo {
    @Override
    public void validar(Jogo jogo) {
        if (jogo.getPreco() < 0) {
            throw new IllegalArgumentException("Preço deve ser maior ou igual a zero");
        }
    }
}
