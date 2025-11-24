package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.model.*;
import dev.projetopoo.ProjetoPoo.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        Carteira carteira = carteiraRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
        Carrinho carrinho = carrinhoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrinho não encontrado"));
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Biblioteca não encontrada"));

        List<Jogo> jogosComprados = new ArrayList<>(carrinho.getJogos());
        double valorTotal = carrinho.getValorTotal();

        if(carteira.getValor() < valorTotal) {
            throw new RuntimeException("Saldo insuficiente na carteira");
        }

        Compra compra =  new Compra();
        compra.setUsuario(usuario);
        compra.setDataCompra(LocalDateTime.now());
        compra.setValor(valorTotal);
        compra.setJogos(jogosComprados);
        compra.setCarrinho(carrinho);
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
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));

        User usuario = compra.getUsuario();
        Carteira carteira = carteiraRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada"));
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Biblioteca não encontrada"));

        carteira.setValor(carteira.getValor() + compra.getValor());
        carteiraRepository.save(carteira);

        biblioteca.getJogos().removeAll(compra.getJogos());
        bibliotecaRepository.save(biblioteca);

        compraRepository.save(compra);
    }

    public List<Compra> getComprasPorUsuario(Long usuarioId) {
        return compraRepository.findByUsuarioId(usuarioId);
    }

    public Compra getCompraPorId(Long idCompra) {
        return compraRepository.findById(idCompra)
                .orElseThrow(() -> new RuntimeException("Compra não encontrada"));
    }
}
