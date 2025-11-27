package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.exception.*;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.repository.JogoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JogoService {

    private final JogoRepository jogoRepository;

    public JogoService(JogoRepository jogoRepository) {
        this.jogoRepository = jogoRepository;
    }

    public List<Jogo> getJogos() {
        return jogoRepository.findAll();
    }

    public Jogo addGame(Jogo jogo) {
        if (jogo.getNome() == null || jogo.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do jogo é obrigatório");
        }
        if (jogo.getPreco() < 0) {
            throw new IllegalArgumentException("Preço deve ser maior ou igual a zero");
        }
        
        if (jogo.getImagemUrl() != null && !jogo.getImagemUrl().trim().isEmpty()) {
            if (!isValidUrl(jogo.getImagemUrl())) {
                throw new IllegalArgumentException("URL da imagem inválida. Deve começar com http:// ou https://");
            }
        }
        
        if (jogoRepository.findByNome(jogo.getNome()).isPresent()) {
            throw JogoJaExisteException.porNome(jogo.getNome());
        }
        
        if (jogo.getDataLancamento() == null) {
            jogo.setDataLancamento(java.time.LocalDate.now());
        }
        
        return jogoRepository.save(jogo);
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
