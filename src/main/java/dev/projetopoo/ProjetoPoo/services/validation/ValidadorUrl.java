package dev.projetopoo.ProjetoPoo.services.validation;

import org.springframework.stereotype.Component;
import dev.projetopoo.ProjetoPoo.model.Jogo;

@Component
public class ValidadorUrl implements ValidadorJogo {
    @Override
    public void validar(Jogo jogo) {
        if (jogo.getImagemUrl() == null) {
            jogo.setImagemUrl("");
        }
        
        if (jogo.getImagemUrl() != null && !jogo.getImagemUrl().trim().isEmpty()) {
            if (!isValidUrl(jogo.getImagemUrl())) {
                throw new IllegalArgumentException("URL da imagem inválida. Deve começar com http:// ou https://");
            }
        } else {
            jogo.setImagemUrl("");
        }
    }

    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        String urlTrimmed = url.trim().toLowerCase();
        return urlTrimmed.startsWith("http://") || urlTrimmed.startsWith("https://");
    }
}
