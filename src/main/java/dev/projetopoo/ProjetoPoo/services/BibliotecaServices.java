package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.exception.*;
import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BibliotecaServices {

    private final BibliotecaRepository bibliotecaRepository;

    public BibliotecaServices(BibliotecaRepository bibliotecaRepository) {
        this.bibliotecaRepository = bibliotecaRepository;
    }

    public List<Jogo> listarJogosUsuario(Long userId) {
        Biblioteca biblioteca = bibliotecaRepository.findByUsuarioId(userId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Biblioteca do usuário não encontrada"));
        return biblioteca.getJogos();
    }
}
