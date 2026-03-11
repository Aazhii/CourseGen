package com.features;

import com.aicourse.enums.UserRole;
import com.aicourse.model.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/features")
public class FeatureController {

    @Autowired
    private FeatureRegistry featureRegistry;

    /**
     * Returns all feature flags and limits for the currently authenticated user.
     * Frontend calls this once after login and stores it in FeatureContext.
     * <p>
     * Response shape:
     * {
     * "COURSE_CREATE":  { "allowed": true,  "limit": 3  },
     * "PROJECT_CREATE": { "allowed": true,  "limit": 2  },
     * "ADMIN_PANEL":    { "allowed": false, "limit": 0  },
     * ...
     * }
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyFeatures(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        UserRole role = principal.getUser().getRoles();

        Map<Feature, FeatureConfig> configs = featureRegistry.getAllForRole(role);

        // Convert to a clean JSON-friendly map
        Map<String, Map<String, Object>> response = new HashMap<>();
        for (Map.Entry<Feature, FeatureConfig> entry : configs.entrySet()) {
            Map<String, Object> configMap = new HashMap<>();
            configMap.put("allowed", entry.getValue().isAllowed());
            configMap.put("limit", entry.getValue().getLimit()); // -1 = unlimited
            response.put(entry.getKey().name(), configMap);
        }

        return ResponseEntity.ok(response);
    }
}