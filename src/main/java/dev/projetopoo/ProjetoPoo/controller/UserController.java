package dev.projetopoo.ProjetoPoo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dev.projetopoo.ProjetoPoo.dto.ChangePasswordRequest;
import dev.projetopoo.ProjetoPoo.dto.EmailAndPassword;
import dev.projetopoo.ProjetoPoo.model.User;
import dev.projetopoo.ProjetoPoo.services.UserServices;

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
    public User login(@RequestBody EmailAndPassword body) {
        return userServices.login(body.email, body.senha);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestBody ChangePasswordRequest request) {
        userServices.changePassword(id, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
