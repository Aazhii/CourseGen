package com.aicourse.service;

import com.aicourse.dto.LoginResponse;
import com.aicourse.dto.UserResponse;
import com.aicourse.model.Users;
import com.aicourse.repo.UserRepo;
import com.aicourse.service.JWT.JWTService;
import com.aicourse.utils.exception.AuthenticationFailedException;
import com.aicourse.utils.id.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class UserService {

    private static final Logger LOGGER = Logger.getLogger(UserService.class.getName());

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JWTService jwtService;

    private final static BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    public Users registerUser(Users user) {
        LOGGER.log(Level.INFO, "Attempting to register new user: {0}", new Object[]{user.getUsername()});
        try {
            user.setId(SnowflakeIdGenerator.generateId());
            user.setPassword(encoder.encode(user.getPassword()));
            // Note: roles and timestamps are now handled automatically in Users.java
            // @PrePersist
            Users savedUser = userRepo.save(user);
            LOGGER.log(Level.INFO, "User registered successfully with ID: {0}", new Object[]{savedUser.getId()});
            return savedUser;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Registration failed for user: {0}: {1}",
                    new Object[]{user.getUsername(), e.getMessage()});
            throw e;
        }
    }

    public LoginResponse verify(Users user) {
        LOGGER.log(Level.INFO, "Attempting to verify user: {0}", new Object[]{user.getUsername()});
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                LOGGER.log(Level.INFO, "Authentication successful for user: {0}", new Object[]{user.getUsername()});
                String token = jwtService.generateToken(user.getUsername());
                Users currentUser = userRepo.findByUsername(user.getUsername());
                return new LoginResponse(token, new UserResponse(currentUser));
            } else {
                LOGGER.log(Level.WARNING, "Authentication failed for user: {0}", new Object[]{user.getUsername()});
                throw new AuthenticationFailedException("User is not verified");
            }
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Login process interrupted for user: {0}: {1}",
                    new Object[]{user.getUsername(), e.getMessage()});
            throw e;
        }
    }

    public static BCryptPasswordEncoder getEncoder() {
        return encoder;
    }
}