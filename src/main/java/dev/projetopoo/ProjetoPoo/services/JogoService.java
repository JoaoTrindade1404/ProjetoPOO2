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
    private final dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository carrinhoRepository;
    private final dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository bibliotecaRepository;
    private final dev.projetopoo.ProjetoPoo.repository.AvaliacaoRepository avaliacaoRepository;
    private final dev.projetopoo.ProjetoPoo.repository.CompraRepository compraRepository;

    public JogoService(JogoRepository jogoRepository,
                       dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository carrinhoRepository,
                       dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository bibliotecaRepository,
                       dev.projetopoo.ProjetoPoo.repository.AvaliacaoRepository avaliacaoRepository,
                       dev.projetopoo.ProjetoPoo.repository.CompraRepository compraRepository) {
        this.jogoRepository = jogoRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.bibliotecaRepository = bibliotecaRepository;
        this.avaliacaoRepository = avaliacaoRepository;
        this.compraRepository = compraRepository;
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
        
        // Atualiza descrição se fornecida
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
        // Remove o jogo de todos os carrinhos
        List<dev.projetopoo.ProjetoPoo.model.Carrinho> carrinhos = carrinhoRepository.findAll();
        for (dev.projetopoo.ProjetoPoo.model.Carrinho carrinho : carrinhos) {
            if (carrinho.getJogos().removeIf(jogo -> jogo.getId().equals(id))) {
                carrinhoRepository.save(carrinho);
            }
        }

        // Remove o jogo de todas as bibliotecas
        List<dev.projetopoo.ProjetoPoo.model.Biblioteca> bibliotecas = bibliotecaRepository.findAll();
        for (dev.projetopoo.ProjetoPoo.model.Biblioteca biblioteca : bibliotecas) {
            if (biblioteca.getJogos().removeIf(jogo -> jogo.getId().equals(id))) {
                bibliotecaRepository.save(biblioteca);
            }
        }

        // Remove todas as avaliações do jogo
        List<dev.projetopoo.ProjetoPoo.model.Avaliacao> avaliacoes = avaliacaoRepository.findByJogoId(id);
        avaliacaoRepository.deleteAll(avaliacoes);

        // Remove o jogo de todas as compras (histórico)
        List<dev.projetopoo.ProjetoPoo.model.Compra> compras = compraRepository.findAll();
        for (dev.projetopoo.ProjetoPoo.model.Compra compra : compras) {
            if (compra.getJogos().removeIf(jogo -> jogo.getId().equals(id))) {
                compraRepository.save(compra);
            }
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
