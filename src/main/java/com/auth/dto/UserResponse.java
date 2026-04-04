package com.auth.dto;

import com.auth.enums.UserRole;
import com.auth.model.Users;

public class UserResponse {

    private final Long id;
    private final String username;
    private final UserRole role;

    public UserResponse(Long id, String username, UserRole role) {
        this.id = id;
        this.username = username;
        this.role = role;
    }

    public UserResponse(Users user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.role = user.getRoles();
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public UserRole getRole() {
        return role;
    }
}

