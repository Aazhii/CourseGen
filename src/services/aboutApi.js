import { apiFetch } from "./apiClient.js";

/**
 * Fetch the authenticated user's profile and stats snapshot.
 * Response shape matches ProfileResponsePojo:
 * { id, username, roles, createdAt, stats: { totalPoints, ... } }
 */
async function getProfile() {
    return apiFetch("/api/about/profile");
}

/**
 * Update the user's username.
 * @param {string} newUsername 
 */
async function updateProfile(newUsername) {
    return apiFetch("/api/about/profile", {
        method: "PUT",
        body: JSON.stringify({ newUsername }),
    });
}

/**
 * Change the user's password.
 * @param {string} currentPassword 
 * @param {string} newPassword 
 * @param {string} confirmPassword 
 */
async function changePassword(currentPassword, newPassword, confirmPassword) {
    return apiFetch("/api/about/password", {
        method: "PUT",
        body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
        }),
    });
}

export {
    getProfile,
    updateProfile,
    changePassword
}
