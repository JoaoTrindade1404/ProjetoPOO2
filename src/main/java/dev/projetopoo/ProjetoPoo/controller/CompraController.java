package dev.projetopoo.ProjetoPoo.controller;


import dev.projetopoo.ProjetoPoo.model.Compra;
import dev.projetopoo.ProjetoPoo.services.CompraServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/compras")
public class CompraController {

    private final CompraServices compraServices;

    public CompraController(CompraServices compraServices) {
        this.compraServices = compraServices;
    }

    @PostMapping("/{usuarioId}")
    public Compra efetuarCompra(@PathVariable Long usuarioId) {
        return compraServices.efetuarCompra(usuarioId);
    }

    @PostMapping("/{compraId}/reembolso")
    public ResponseEntity<Void> efetuarReembolso(@PathVariable Long compraId) {
        compraServices.efetuarReembolso(compraId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Compra> getComprasPorUsuario(@PathVariable Long usuarioId) {
        return compraServices.getComprasPorUsuario(usuarioId);
    }

    @GetMapping("/{compraId}")
    public Compra getCompraPorId(@PathVariable Long compraId) {
        return compraServices.getCompraPorId(compraId);
    }

}
