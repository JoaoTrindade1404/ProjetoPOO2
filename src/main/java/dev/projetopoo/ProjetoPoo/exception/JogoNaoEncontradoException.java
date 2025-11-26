package dev.projetopoo.ProjetoPoo.exception;

public class JogoNaoEncontradoException extends RuntimeException {
    public JogoNaoEncontradoException(String message) {
        super(message);
    }
    
    public JogoNaoEncontradoException(Long jogoId) {
        super(String.format("Jogo com ID %d não foi encontrado", jogoId));
    }
}
