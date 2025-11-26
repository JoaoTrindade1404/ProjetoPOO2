package dev.projetopoo.ProjetoPoo.exception;

public class JogoJaExisteException extends RuntimeException {
    public JogoJaExisteException(String message) {
        super(message);
    }
    
    public static JogoJaExisteException porNome(String nomeJogo) {
        return new JogoJaExisteException(String.format("O jogo '%s' já existe no sistema", nomeJogo));
    }
}
