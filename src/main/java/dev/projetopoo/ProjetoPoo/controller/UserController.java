package dev.projetopoo.ProjetoPoo.controller;

import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.services.UserServices;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    private final UserServices userServices;

    public UserController(UserServices userServices) {
        this.userServices = userServices;
    }

    @GetMapping
    public List<User> getUsers() {
        return userServices.getAllUsers();
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userServices.addUser(user);
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userServices.getUserById(id);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userServices.updateUser(id, user);
    }

    @PostMapping("/login")
    public User login(@RequestBody String email, @RequestBody String senha) {
        return userServices.login(email, senha);
    }
}
