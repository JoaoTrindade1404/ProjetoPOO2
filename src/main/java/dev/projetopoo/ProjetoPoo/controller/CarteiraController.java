package dev.projetopoo.ProjetoPoo.controller;


import dev.projetopoo.ProjetoPoo.dto.ValorRequest;
import dev.projetopoo.ProjetoPoo.model.Carteira;
import dev.projetopoo.ProjetoPoo.services.CarteiraServices;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/wallet")
public class CarteiraController {

    private final CarteiraServices carteiraServices;


    public CarteiraController(CarteiraServices carteiraServices) {
        this.carteiraServices = carteiraServices;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Double> adicionarValor(@PathVariable Long userId, @RequestBody ValorRequest request) {
        double novoSaldo = carteiraServices.adicionarValor(userId, request.valor);
        return ResponseEntity.ok(novoSaldo);
    }


}
