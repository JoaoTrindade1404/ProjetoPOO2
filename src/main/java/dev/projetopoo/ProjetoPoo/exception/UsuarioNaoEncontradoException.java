package dev.projetopoo.ProjetoPoo.exception;

public class UsuarioNaoEncontradoException extends RuntimeException {
    public UsuarioNaoEncontradoException(String message) {
        super(message);
    }
    
    public UsuarioNaoEncontradoException(Long usuarioId) {
        super(String.format("Usuário com ID %d não foi encontrado", usuarioId));
    }
}
