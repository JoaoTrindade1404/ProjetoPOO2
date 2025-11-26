package dev.projetopoo.ProjetoPoo.exception;

public class CarrinhoVazioException extends RuntimeException {
    public CarrinhoVazioException(String message) {
        super(message);
    }
    
    public CarrinhoVazioException() {
        super("Não é possível finalizar a compra. O carrinho está vazio.");
    }
}
