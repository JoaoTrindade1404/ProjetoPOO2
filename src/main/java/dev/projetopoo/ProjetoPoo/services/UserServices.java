package dev.projetopoo.ProjetoPoo.services;

import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServices {

    private final UserRepository userRepository;

    public UserServices(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        return userRepository.save(user);
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
