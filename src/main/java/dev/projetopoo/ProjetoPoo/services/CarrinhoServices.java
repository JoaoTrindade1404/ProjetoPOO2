package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.exception.*;
import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Carrinho;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository;
import dev.projetopoo.ProjetoPoo.repository.JogoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarrinhoServices {

    private final CarrinhoRepository carrinhoRepository;
    private final JogoRepository jogoRepository;
    private final BibliotecaRepository bibliotecaRepository;

    public CarrinhoServices(CarrinhoRepository carrinhoRepository, JogoRepository jogoRepository, BibliotecaRepository bibliotecaRepository) {
        this.carrinhoRepository = carrinhoRepository;
        this.jogoRepository = jogoRepository;
        this.bibliotecaRepository = bibliotecaRepository;
    }

    public void adicionarJogo(Long usuarioId, Long jogoId) {
        Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carrinho do usuário não encontrado"));

        Jogo jogo = jogoRepository.findById(jogoId)
                .orElseThrow(() -> new JogoNaoEncontradoException(jogoId));

        // Verifica se o usuário já possui o jogo na biblioteca
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Biblioteca do usuário não encontrada"));
        
        boolean jaTemNaBiblioteca = biblioteca.getJogos()
                .stream()
                .anyMatch(j -> j.getId().equals(jogo.getId()));
        
        if (jaTemNaBiblioteca) {
            throw new IllegalArgumentException("Você já possui o jogo '" + jogo.getNome() + "' na sua biblioteca");
        }

        // Verifica se o jogo já está no carrinho
        boolean jaTemNoCarrinho = carrinho.getJogos()
                .stream()
                .anyMatch(j -> j.getId().equals(jogo.getId()));

        if (jaTemNoCarrinho) {
            throw new IllegalArgumentException("O jogo '" + jogo.getNome() + "' já está no carrinho");
        }

        carrinho.getJogos().add(jogo);

        double novoTotal = carrinho.getJogos().stream()
                .mapToDouble(Jogo::getPreco)
                .sum();

        carrinho.setValorTotal(novoTotal);

        carrinhoRepository.save(carrinho);
    }

    public void removerJogo(Long usuarioId, Long jogoId) {
        Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carrinho do usuário não encontrado"));

        boolean removido = carrinho.getJogos().removeIf(j -> j.getId().equals(jogoId));
        
        if (!removido) {
            throw new JogoNaoEncontradoException("Jogo não encontrado no carrinho");
        }

        double novoTotal = carrinho.getJogos().stream()
                .mapToDouble(Jogo::getPreco)
                .sum();

        carrinho.setValorTotal(novoTotal);

        carrinhoRepository.save(carrinho);
    }

    public List<Jogo> getJogos(Long usuarioId) {
        Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carrinho do usuário não encontrado"));

        return carrinho.getJogos();
    }
}


