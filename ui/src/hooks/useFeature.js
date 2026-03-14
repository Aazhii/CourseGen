import { useFeatureContext } from "../context/FeatureContext";

/**
 * useFeature("COURSE_CREATE")
 * Returns { allowed: boolean, limit: number, isUnlimited: boolean, loading: boolean }
 *
 * limit === -1 means unlimited.
 * If the feature is not yet loaded, allowed defaults to false (safe default).
 */
export function useFeature(featureKey) {
    const { features, featuresLoading } = useFeatureContext();

    if (featuresLoading) {
        return { allowed: false, limit: 0, isUnlimited: false, loading: true };
    }

    const config = features[featureKey];
    if (!config) {
        return { allowed: false, limit: 0, isUnlimited: false, loading: false };
    }

    return {
        allowed: config.allowed,
        limit: config.limit,
        isUnlimited: config.limit === -1,
        loading: false
    };
}
