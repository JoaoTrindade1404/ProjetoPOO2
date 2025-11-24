package dev.projetopoo.ProjetoPoo.controller;


import dev.projetopoo.ProjetoPoo.dto.AddJogoRequest;
import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.services.CarrinhoServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
public class CarrinhoController {

    private final CarrinhoServices services;

    public CarrinhoController(CarrinhoServices services) {
        this.services = services;
    }

    @PostMapping("/usuario/{usuarioId}/jogos")
    public ResponseEntity<Void> adicionarJogo(@PathVariable Long usuarioId,
                                              @RequestBody AddJogoRequest body) {
        services.adicionarJogo(usuarioId, body.jogoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/usuario/{usuarioId}/jogos/{jogoId}")
    public ResponseEntity<Void> removerJogo(@PathVariable Long usuarioId,
                                            @PathVariable Long jogoId) {
        services.removerJogo(usuarioId, jogoId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/usuario/{usuarioId}/jogos")
    public List<Jogo> getJogos(@PathVariable Long usuarioId) {
        return services.getJogos(usuarioId);
    }


}
