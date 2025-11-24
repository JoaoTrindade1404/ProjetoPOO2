package dev.projetopoo.ProjetoPoo.services;

import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Carrinho;
import dev.projetopoo.ProjetoPoo.model.Carteira;
import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository;
import dev.projetopoo.ProjetoPoo.repository.CarteiraRepository;
import dev.projetopoo.ProjetoPoo.repository.UserRepository;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServices {

    private final UserRepository userRepository;
    private final CarteiraRepository carteiraRepository;
    private final CarrinhoRepository carrinhoRepository;
    private final BibliotecaRepository bibliotecaRepository;

    public UserServices(UserRepository userRepository,
                        CarrinhoRepository carrinhoRepository,
                        BibliotecaRepository bibliotecaRepository,
                        CarteiraRepository carteiraRepository) {
        this.userRepository = userRepository;
        this.carrinhoRepository = carrinhoRepository;
        this.bibliotecaRepository = bibliotecaRepository;
        this.carteiraRepository = carteiraRepository;

    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuário com ID não encontrado: " + id));
    }

    public User addUser(User user) {
        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado!");
        }
        User savedUser = userRepository.save(user);

        Carteira carteira = new Carteira();
        carteira.setUsuario(savedUser);
        carteira.setValor(0.0);
        carteiraRepository.save(carteira);

        Carrinho carrinho = new Carrinho();
        carrinho.setUsuario(savedUser);
        carrinho.setValorTotal(0.0);
        carrinhoRepository.save(carrinho);

        Biblioteca biblioteca = new Biblioteca();
        biblioteca.setUsuario(savedUser);
        bibliotecaRepository.save(biblioteca);

        return savedUser;

    }

    public User updateUser(Long id, User userAtulizado) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Usuário com ID não encontrado: " + id));
        user.setNome(userAtulizado.getNome());
        user.setEmail(userAtulizado.getEmail());
        user.setSenha(userAtulizado.getSenha());

        return userRepository.save(user);
    }

    public User login(String email, String senha) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Credenciais diferentes"));
        if(!user.getSenha().equals(senha)) {
            throw new RuntimeException("Credenciais diferentes");
        }
        return user;
    }


}
