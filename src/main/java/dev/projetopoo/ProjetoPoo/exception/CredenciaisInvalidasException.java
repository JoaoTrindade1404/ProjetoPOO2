package dev.projetopoo.ProjetoPoo.exception;

public class CredenciaisInvalidasException extends RuntimeException {
    public CredenciaisInvalidasException(String message) {
        super(message);
    }
    
    public CredenciaisInvalidasException() {
        super("Email ou senha inválidos. Verifique suas credenciais e tente novamente.");
    }
}
