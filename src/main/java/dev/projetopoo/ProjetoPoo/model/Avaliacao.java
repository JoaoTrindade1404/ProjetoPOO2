package dev.projetopoo.ProjetoPoo.model;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "rating",
        uniqueConstraints = @UniqueConstraint(columnNames = {"usuario_id", "jogo_id"})
)
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "jogo_id", nullable = false)
    private Jogo jogo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private User usuario;

    private int nota;

    private String comentario;

    public Avaliacao() {}
}
