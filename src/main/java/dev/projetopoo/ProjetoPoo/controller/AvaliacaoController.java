package dev.projetopoo.ProjetoPoo.controller;


import dev.projetopoo.ProjetoPoo.dto.AvaliacaoDTO;
import dev.projetopoo.ProjetoPoo.model.Avaliacao;
import dev.projetopoo.ProjetoPoo.services.AvaliacaoServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/avaliacao")
public class AvaliacaoController {

    private final AvaliacaoServices avaliacaoServices;

    public AvaliacaoController(AvaliacaoServices avaliacaoServices) {
        this.avaliacaoServices = avaliacaoServices;
    }

    @PostMapping("/avaliacoes/usuario/{usuarioId}/jogo/{jogoId}")
    public ResponseEntity<Avaliacao> criarAvaliacao(@PathVariable Long usuarioId, @PathVariable Long jogoId, @RequestBody AvaliacaoDTO body) {
        Avaliacao avaliacao = avaliacaoServices.avaliar(usuarioId, jogoId, body.nota, body.comentario);

        return ResponseEntity.ok(avaliacao);
    }

    @GetMapping("/jogo/{jogoId}")
    public List<Avaliacao> getAvaliacoesPorJogo(@PathVariable Long jogoId) {
        return avaliacaoServices.getAvaliacoesPorJogo(jogoId);
    }

    @DeleteMapping("/{avaliacaoId}")
    public ResponseEntity<Void> deletarAvaliacao(@PathVariable Long avaliacaoId) {
        avaliacaoServices.deletarAvaliacao(avaliacaoId);
        return ResponseEntity.ok().build();
    }
}
