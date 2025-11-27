package dev.projetopoo.ProjetoPoo.services;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import dev.projetopoo.ProjetoPoo.exception.CarrinhoVazioException;
import dev.projetopoo.ProjetoPoo.exception.SaldoInsuficienteException;
import dev.projetopoo.ProjetoPoo.exception.UsuarioNaoEncontradoException;
import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Carrinho;
import dev.projetopoo.ProjetoPoo.model.Carteira;
import dev.projetopoo.ProjetoPoo.model.Compra;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository;
import dev.projetopoo.ProjetoPoo.repository.CarteiraRepository;
import dev.projetopoo.ProjetoPoo.repository.CompraRepository;
import dev.projetopoo.ProjetoPoo.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class CompraServices {

    private final CompraRepository compraRepository;
    private final UserRepository userRepository;
    private final CarteiraRepository carteiraRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final BibliotecaRepository bibliotecaRepository;

    public CompraServices(CompraRepository compraRepository,
                          UserRepository userRepository,
                          CarteiraRepository carteiraRepository,
                          CarrinhoRepository carrinhoRepository,
                          BibliotecaRepository bibliotecaRepository) {
        this.compraRepository = compraRepository;
        this.userRepository = userRepository;
        this.carteiraRepository = carteiraRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.bibliotecaRepository = bibliotecaRepository;
    }

    @Transactional
    public Compra efetuarCompra(Long usuarioId) {
        User usuario = userRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(usuarioId));
        Carteira carteira = carteiraRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carteira do usuário não encontrada"));
        Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carrinho do usuário não encontrado"));
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Biblioteca do usuário não encontrada"));

        List<Jogo> jogosComprados = new ArrayList<>(carrinho.getJogos());
        double valorTotal = carrinho.getValorTotal();

        if (jogosComprados.isEmpty()) {
            throw new CarrinhoVazioException();
        }

        for (Jogo jogo : jogosComprados) {
            boolean jaTemNaBiblioteca = biblioteca.getJogos()
                    .stream()
                    .anyMatch(j -> j.getId().equals(jogo.getId()));
            
            if (jaTemNaBiblioteca) {
                throw new IllegalArgumentException("Você já possui o jogo '" + jogo.getNome() + "' na sua biblioteca. Remova-o do carrinho antes de finalizar a compra.");
            }
        }

        if(carteira.getValor() < valorTotal) {
            throw new SaldoInsuficienteException(carteira.getValor(), valorTotal);
        }

        Compra compra =  new Compra();
        compra.setUsuario(usuario);
        compra.setDataCompra(LocalDateTime.now());
        compra.setValor(valorTotal);
        compra.setJogos(jogosComprados);

        compraRepository.save(compra);

        carteira.setValor(carteira.getValor() - valorTotal);
        carteiraRepository.save(carteira);

        biblioteca.getJogos().addAll(jogosComprados);
        bibliotecaRepository.save(biblioteca);

        carrinho.getJogos().clear();
        carrinho.setValorTotal(0.0);
        carrinhoRepository.save(carrinho);

        return compra;

    }

    @Transactional
    public void efetuarReembolso(Long compraId){
        Compra compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new IllegalArgumentException("Compra com ID " + compraId + " não foi encontrada"));

        if (compra.isReembolsado()) {
            throw new IllegalArgumentException("Esta compra já foi reembolsada.");
        }

        User usuario = compra.getUsuario();
        Carteira carteira = carteiraRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Carteira do usuário não encontrada"));
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Biblioteca do usuário não encontrada"));

        carteira.setValor(carteira.getValor() + compra.getValor());
        carteiraRepository.save(carteira);

        biblioteca.getJogos().removeAll(compra.getJogos());
        bibliotecaRepository.save(biblioteca);

        compra.setReembolsado(true);
        compraRepository.save(compra);
    }

    public List<Compra> getComprasPorUsuario(Long usuarioId) {
        return compraRepository.findByUsuarioId(usuarioId);
    }

    public Compra getCompraPorId(Long idCompra) {
        return compraRepository.findById(idCompra)
                .orElseThrow(() -> new IllegalArgumentException("Compra com ID " + idCompra + " não foi encontrada"));
    }
}
