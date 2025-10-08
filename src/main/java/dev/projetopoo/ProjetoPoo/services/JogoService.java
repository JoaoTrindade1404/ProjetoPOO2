package dev.projetopoo.ProjetoPoo.services;


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
        return jogoRepository.save(jogo);
    }

    public Jogo getJogoById(Long id) {
        return jogoRepository.findById(id).orElseThrow(() -> new RuntimeException("Jogo não encontrado com id: " + id));
    }

    public Jogo updateJogo(Long id, Jogo jogoAtualizado) {
        Jogo jogo = jogoRepository.findById(id).orElseThrow(() -> new RuntimeException("Jogo não encontrado com id: " + id));
        jogo.setNome(jogoAtualizado.getNome());
        jogo.setGender(jogoAtualizado.getGender());
        jogo.setPreco(jogoAtualizado.getPreco());
        return jogoRepository.save(jogo);
    }

}
