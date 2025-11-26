package dev.projetopoo.ProjetoPoo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "jogo_table")
public class Jogo {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String gender;
    private double preco;
    private String descricao;
    private LocalDate dataLancamento;
    private double avaliacao;
    
    @Column(name = "imagem_url", length = 500)
    private String imagemUrl;

    public Jogo() {
    }

    public Jogo(Long id, String nome, String gender, double preco) {
        this.id = id;
        this.nome = nome;
        this.gender = gender;
        this.preco = preco;
        this.descricao = "";
        this.dataLancamento = LocalDate.now();
        this.avaliacao = 0;
        this.imagemUrl = "";
    }


}
