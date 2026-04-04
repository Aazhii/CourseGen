package com.auth.controller;

import com.auth.dto.LoginResponse;
import com.auth.dto.UserResponse;
import com.auth.model.UserPrincipal;
import com.auth.model.Users;
import com.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Level;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private static final Logger LOGGER = Logger.getLogger(UserController.class.getName());

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public Users registerUser(@RequestBody Users user) {
        LOGGER.log(Level.INFO, "Request received to register user: {0}", new Object[]{user.getUsername()});
        try {
            Users registeredUser = service.registerUser(user);
            LOGGER.log(Level.INFO, "User registered successfully: {0}", new Object[]{registeredUser.getUsername()});
            return registeredUser;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error registering user: {0}: {1}",
                    new Object[]{user.getUsername(), e.getMessage()});
            throw e;
        }
    }

    @PostMapping("/login")
    public LoginResponse verifyUser(@RequestBody Users user) {
        LOGGER.log(Level.INFO, "Login request received for user: {0}", new Object[]{user.getUsername()});
        try {
            LoginResponse response = service.verify(user); // returns JWT
            LOGGER.log(Level.INFO, "User logged in successfully: {0}", new Object[]{user.getUsername()});
            return response;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error logging in user: {0}: {1}",
                    new Object[]{user.getUsername(), e.getMessage()});
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        LOGGER.log(Level.FINE, "Request received for /me endpoint");
        if (authentication == null || !authentication.isAuthenticated()) {
            LOGGER.log(Level.WARNING, "Unauthorized access attempt to /me");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Users user = principal.getUser();

        LOGGER.log(Level.INFO, "Fetched details for currently authenticated user: {0}", new Object[]{user.getUsername()});
        return ResponseEntity.ok(new UserResponse(user.getId(), user.getUsername(), user.getRoles()));
    }
}
