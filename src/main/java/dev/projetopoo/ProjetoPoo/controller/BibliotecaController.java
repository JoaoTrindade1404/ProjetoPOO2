package dev.projetopoo.ProjetoPoo.controller;

import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.services.BibliotecaServices;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/library")
public class BibliotecaController {

    private final BibliotecaServices bibliotecaServices;

    public BibliotecaController(BibliotecaServices bibliotecaServices) {
        this.bibliotecaServices = bibliotecaServices;
    }

    @GetMapping("/usuario/{usuarioId}/jogos")
    public List<Jogo> getBibliotecaById(@PathVariable Long usuarioId) {
        return bibliotecaServices.listarJogosUsuario(usuarioId);
    }

}
