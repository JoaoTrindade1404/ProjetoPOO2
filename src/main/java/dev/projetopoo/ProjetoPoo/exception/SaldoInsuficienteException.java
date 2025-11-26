package dev.projetopoo.ProjetoPoo.exception;

public class SaldoInsuficienteException extends RuntimeException {
    public SaldoInsuficienteException(String message) {
        super(message);
    }
    
    public SaldoInsuficienteException(double saldoAtual, double valorNecessario) {
        super(String.format("Saldo insuficiente para realizar a compra. Saldo atual: R$ %.2f, Valor necessário: R$ %.2f", 
              saldoAtual, valorNecessario));
    }
}
