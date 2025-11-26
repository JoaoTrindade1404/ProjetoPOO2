package dev.projetopoo.ProjetoPoo.services;


import dev.projetopoo.ProjetoPoo.model.Carteira;
import dev.projetopoo.ProjetoPoo.repository.CarteiraRepository;
import org.springframework.stereotype.Service;

@Service
public class CarteiraServices {

    private final CarteiraRepository carteiraRepository;

    public CarteiraServices(CarteiraRepository carteiraRepository) {
        this.carteiraRepository = carteiraRepository;
    }

    public double adicionarValor(Long usuarioId, double valor){
        Carteira carteira = carteiraRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada!"));

        carteira.setValor(carteira.getValor() + valor);
        carteiraRepository.save(carteira);
        return  carteira.getValor();
    }

    public double verSaldo(Long usuarioId){
        Carteira carteira = carteiraRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carteira não encontrada!"));

        return carteira.getValor();
    }
}
