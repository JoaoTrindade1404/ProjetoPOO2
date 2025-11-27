package dev.projetopoo.ProjetoPoo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.projetopoo.ProjetoPoo.exception.JogoJaExisteException;
import dev.projetopoo.ProjetoPoo.exception.JogoNaoEncontradoException;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.repository.JogoRepository;

@Service
public class JogoService {

    private final JogoRepository jogoRepository;
    private final java.util.List<dev.projetopoo.ProjetoPoo.services.validation.ValidadorJogo> validadores;

    public JogoService(JogoRepository jogoRepository, java.util.List<dev.projetopoo.ProjetoPoo.services.validation.ValidadorJogo> validadores) {
        this.jogoRepository = jogoRepository;
        this.validadores = validadores;
    }

    public List<Jogo> getJogos() {
        return jogoRepository.findAll();
    }

    public Jogo addGame(Jogo jogo) {
        // OCP: Validations are now decoupled and open for extension
        validadores.forEach(v -> v.validar(jogo));
        
        if (jogoRepository.findByNome(jogo.getNome()).isPresent()) {
            throw JogoJaExisteException.porNome(jogo.getNome());
        }
        
        try {
            return jogoRepository.save(jogo);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao salvar jogo: " + e.getMessage(), e);
        }
    }

    public Jogo getJogoById(Long id) {
        return jogoRepository.findById(id).orElseThrow(() -> new JogoNaoEncontradoException(id));
    }

    public Jogo updateJogo(Long id, Jogo jogoAtualizado) {
        Jogo jogo = jogoRepository.findById(id).orElseThrow(() -> new JogoNaoEncontradoException(id));
        
        if (jogoAtualizado.getNome() != null && !jogoAtualizado.getNome().trim().isEmpty()) {
            jogoRepository.findByNome(jogoAtualizado.getNome())
                .ifPresent(existingJogo -> {
                    if (!existingJogo.getId().equals(id)) {
                        throw JogoJaExisteException.porNome(jogoAtualizado.getNome());
                    }
                });
            jogo.setNome(jogoAtualizado.getNome());
        }
        
        if (jogoAtualizado.getGender() != null && !jogoAtualizado.getGender().trim().isEmpty()) {
            jogo.setGender(jogoAtualizado.getGender());
        }

        if (jogoAtualizado.getDescricao() != null && !jogoAtualizado.getDescricao().trim().isEmpty()) {
            jogo.setDescricao(jogoAtualizado.getDescricao());
        }

        if (jogoAtualizado.getAvaliacao() >= 0) {
            jogo.setAvaliacao(jogoAtualizado.getAvaliacao());
        }
        
        if (jogoAtualizado.getDescricao() != null) {
            jogo.setDescricao(jogoAtualizado.getDescricao());
        }
        
        if (jogoAtualizado.getPreco() >= 0) {
            jogo.setPreco(jogoAtualizado.getPreco());
        } else {
            throw new IllegalArgumentException("Preço deve ser maior ou igual a zero");
        }
    
        if (jogoAtualizado.getImagemUrl() != null) {
            if (!jogoAtualizado.getImagemUrl().trim().isEmpty()) {
                if (!isValidUrl(jogoAtualizado.getImagemUrl())) {
                    throw new IllegalArgumentException("URL da imagem inválida. Deve começar com http:// ou https://");
                }
                jogo.setImagemUrl(jogoAtualizado.getImagemUrl());
            } else {
                jogo.setImagemUrl("");
            }
        }
        
        return jogoRepository.save(jogo);
    }

    public void deleteJogo(Long id) {
        if (!jogoRepository.existsById(id)) {
            throw new JogoNaoEncontradoException(id);
        }
        jogoRepository.deleteById(id);
    }
    
    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        
        String urlTrimmed = url.trim().toLowerCase();
        return urlTrimmed.startsWith("http://") || urlTrimmed.startsWith("https://");
    }

}
