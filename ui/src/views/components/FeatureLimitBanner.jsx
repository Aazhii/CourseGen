import React from "react";
import { Sparkles } from "lucide-react";

export default function FeatureLimitBanner({ limit, isUnlimited, currentCount, featureName }) {
    if (isUnlimited || currentCount < limit) return null;

    return (
        <div className="limit-banner fade-up">
            <div className="limit-banner-content">
                <Sparkles className="limit-icon" size={20} />
                <p>⚠️ You've reached your {limit}-{featureName} limit on the free plan.</p>
            </div>
            <button className="premium-upgrade-btn">
                Upgrade to Premium
            </button>
        </div>
    );
}
