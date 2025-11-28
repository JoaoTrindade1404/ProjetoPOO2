package dev.projetopoo.ProjetoPoo.services;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.projetopoo.ProjetoPoo.exception.CredenciaisInvalidasException;
import dev.projetopoo.ProjetoPoo.exception.UsuarioNaoEncontradoException;
import dev.projetopoo.ProjetoPoo.model.Biblioteca;
import dev.projetopoo.ProjetoPoo.model.Carrinho;
import dev.projetopoo.ProjetoPoo.model.Carteira;
import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.repository.BibliotecaRepository;
import dev.projetopoo.ProjetoPoo.repository.CarrinhoRepository;
import dev.projetopoo.ProjetoPoo.repository.CarteiraRepository;
import dev.projetopoo.ProjetoPoo.repository.UserRepository;

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
        return userRepository.findById(id).orElseThrow(() -> new UsuarioNaoEncontradoException(id));
    }

    public User addUser(User user) {
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        if (user.getNome() == null || user.getNome().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (user.getSenha() == null || user.getSenha().trim().isEmpty()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        
        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("E-mail já cadastrado: " + user.getEmail());
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
        User user = userRepository.findById(id).orElseThrow(() -> new UsuarioNaoEncontradoException(id));
        
        if (userAtulizado.getNome() != null && !userAtulizado.getNome().trim().isEmpty()) {
            user.setNome(userAtulizado.getNome());
        }
        if (userAtulizado.getEmail() != null && !userAtulizado.getEmail().trim().isEmpty()) {
            userRepository.findByEmail(userAtulizado.getEmail())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(id)) {
                        throw new IllegalArgumentException("E-mail já cadastrado: " + userAtulizado.getEmail());
                    }
                });
            user.setEmail(userAtulizado.getEmail());
        }
        if (userAtulizado.getSenha() != null && !userAtulizado.getSenha().trim().isEmpty()) {
            user.setSenha(userAtulizado.getSenha());
        }

        return userRepository.save(user);
    }

    public User login(String email, String senha) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        if (senha == null || senha.trim().isEmpty()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CredenciaisInvalidasException());
        if(!user.getSenha().equals(senha)) {
            throw new CredenciaisInvalidasException();
        }
        return user;
    }

    public void changePassword(Long id, String currentPassword, String newPassword) {
        if (currentPassword == null || currentPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Senha atual é obrigatória");
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("Nova senha é obrigatória");
        }
        
        User user = userRepository.findById(id).orElseThrow(() -> new UsuarioNaoEncontradoException(id));
        
        if (!user.getSenha().equals(currentPassword)) {
            throw new CredenciaisInvalidasException();
        }
        
        user.setSenha(newPassword);
        userRepository.save(user);
    }
}
