package com.about.pojo;

public class UpdateProfileRequestPojo {
    private String newUsername;

    public UpdateProfileRequestPojo() {
    }

    public UpdateProfileRequestPojo(String newUsername) {
        this.newUsername = newUsername;
    }

    public String getNewUsername() {
        return newUsername;
    }

    public void setNewUsername(String newUsername) {
        this.newUsername = newUsername;
    }
}
