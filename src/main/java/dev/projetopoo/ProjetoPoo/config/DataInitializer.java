package dev.projetopoo.ProjetoPoo.config;

import dev.projetopoo.ProjetoPoo.model.Jogo;
import dev.projetopoo.ProjetoPoo.repository.JogoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(JogoRepository jogoRepository) {
        return args -> {
            List<Jogo> jogos = jogoRepository.findAll();
            boolean updated = false;
            
            for (Jogo jogo : jogos) {
                if (jogo.getDataLancamento() == null) {
                    jogo.setDataLancamento(LocalDate.now());
                    jogoRepository.save(jogo);
                    updated = true;
                }
            }
            
            if (updated) {
                System.out.println("✅ DataInitializer: Datas de lançamento ausentes foram preenchidas.");
            }
        };
    }
}
