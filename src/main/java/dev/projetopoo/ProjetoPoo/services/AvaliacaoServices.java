package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.exception.*;
import dev.projetopoo.ProjetoPoo.model.Avaliacao;
import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.repository.AvaliacaoRepository;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import dev.projetopoo.ProjetoPoo.repository.JogoRepository;
import dev.projetopoo.ProjetoPoo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AvaliacaoServices {

    private final AvaliacaoRepository avaliacaoRepository;
    private final BibliotecaRepository bibliotecaRepository;
    private final UserRepository userRepository;
    private final JogoRepository jogoRepository;

    public AvaliacaoServices(AvaliacaoRepository avaliacaoRepository,  BibliotecaRepository bibliotecaRepository,  UserRepository userRepository, JogoRepository jogoRepository) {
        this.avaliacaoRepository = avaliacaoRepository;
        this.bibliotecaRepository = bibliotecaRepository;
        this.userRepository = userRepository;
        this.jogoRepository = jogoRepository;
    }

    public Avaliacao avaliar(Long usuarioId, Long jogoId, int nota, String descricao) {
        if (nota < 0 || nota > 5) {
            throw new IllegalArgumentException("A nota deve ser entre 0 e 5");
        }

        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Biblioteca do usuário não encontrada"));

        boolean possuiJogo = biblioteca.getJogos().stream().anyMatch(j -> j.getId().equals(jogoId));

        if (!possuiJogo) {
            throw new IllegalArgumentException("Você deve possuir o jogo na sua biblioteca para poder avaliá-lo");
        }

        Optional<Avaliacao> existente = avaliacaoRepository.findByUsuarioIdAndJogoId(usuarioId, jogoId);

        if (existente.isPresent()) {
            throw new IllegalArgumentException("Você já avaliou este jogo");
        }

        User usuario = userRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(usuarioId));
        Jogo jogo = jogoRepository.findById(jogoId)
                .orElseThrow(() -> new JogoNaoEncontradoException(jogoId));

        Avaliacao avaliacao = new Avaliacao();
        avaliacao.setUsuario(usuario);
        avaliacao.setJogo(jogo);
        avaliacao.setNota(nota);
        avaliacao.setComentario(descricao);

        return avaliacaoRepository.save(avaliacao);
    }

    public List<Avaliacao> getAvaliacoesPorJogo(Long jogoId) {
        // Verifica se o jogo existe
        jogoRepository.findById(jogoId)
                .orElseThrow(() -> new JogoNaoEncontradoException(jogoId));
        
        return avaliacaoRepository.findByJogoId(jogoId);
    }

    public void deletarAvaliacao(Long avaliacaoId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(avaliacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Avaliação com ID " + avaliacaoId + " não foi encontrada"));
        
        avaliacaoRepository.delete(avaliacao);
    }
}
