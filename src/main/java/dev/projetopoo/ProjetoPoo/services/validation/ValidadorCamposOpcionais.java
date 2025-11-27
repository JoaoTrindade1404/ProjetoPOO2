package dev.projetopoo.ProjetoPoo.services.validation;

import org.springframework.stereotype.Component;
import dev.projetopoo.ProjetoPoo.model.Jogo;

@Component
public class ValidadorCamposOpcionais implements ValidadorJogo {
    @Override
    public void validar(Jogo jogo) {
        if (jogo.getGender() == null) {
            jogo.setGender("");
        }
        
        if (jogo.getDescricao() == null) {
            jogo.setDescricao("");
        }

        if (jogo.getAvaliacao() < 0) {
            jogo.setAvaliacao(0.0);
        }

        if (jogo.getDataLancamento() == null) {
            jogo.setDataLancamento(java.time.LocalDate.now());
        }
        
        // Ensure active is set (though it has default in entity, good to enforce in business logic if needed)
        jogo.setAtivo(true);
    }
}
