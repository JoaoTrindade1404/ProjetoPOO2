package dev.projetopoo.ProjetoPoo.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "library")
public class Biblioteca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", unique = true)
    private User usuario;

    @ManyToMany
    @JoinTable(
            name = "biblioteca_jogos",
            joinColumns = @JoinColumn(name = "biblioteca_id"),
            inverseJoinColumns = @JoinColumn(name = "jogo_id")
    )
    private List<Jogo> jogos = new ArrayList<>();

    public Biblioteca() {}

    public Biblioteca (User usuario) {
        this.usuario = usuario;
    }

}
