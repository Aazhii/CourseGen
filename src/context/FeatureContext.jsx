import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../services/apiClient";

const FeatureContext = createContext(null);

/**
 * Fetches /api/features/me once after login.
 * Provides feature flags to the entire app.
 */
export function FeatureProvider({ children }) {
    const { token } = useAuth();
    const [features, setFeatures] = useState({});
    const [featuresLoading, setFeaturesLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            setFeatures({});
            setFeaturesLoading(false);
            return;
        }

        const loadFeatures = async () => {
            try {
                setFeaturesLoading(true);
                const data = await apiFetch("/api/features/me");
                setFeatures(data);
            } catch (err) {
                console.error("Failed to load feature flags:", err);
                setFeatures({});
            } finally {
                setFeaturesLoading(false);
            }
        };

        loadFeatures();
    }, [token]); // Re-fetch when token changes (login/logout/role upgrade)

    return (
        <FeatureContext.Provider value={{ features, featuresLoading }}>
            {children}
        </FeatureContext.Provider>
    );
}

export const useFeatureContext = () => useContext(FeatureContext);
