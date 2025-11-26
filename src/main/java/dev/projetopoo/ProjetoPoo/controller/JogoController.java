package dev.projetopoo.ProjetoPoo.controller;

import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.services.JogoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jogo")
public class JogoController {

    private final JogoService jogoService;

    public JogoController(JogoService jogoService) {
        this.jogoService = jogoService;
    }

    @GetMapping
    public List<Jogo> getJogos() {
        return jogoService.getJogos();
    }

    @PostMapping
    public Jogo addGame(@RequestBody Jogo jogo) {
        return jogoService.addGame(jogo);
    }

    @GetMapping("/{id}")
    public Jogo getJogoById(@PathVariable Long id) {
        return jogoService.getJogoById(id);
    }

    @PutMapping("/{id}")
    public Jogo updateJogo(@PathVariable Long id, @RequestBody Jogo jogoAtualizado) {
        return jogoService.updateJogo(id, jogoAtualizado);
    }

    @DeleteMapping("/{id}")
    public void deleteJogo(@PathVariable Long id) {
        jogoService.deleteJogo(id);
    }
}
