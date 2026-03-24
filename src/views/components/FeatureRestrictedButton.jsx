import React from "react";
import { Lock } from "lucide-react";

export default function FeatureRestrictedButton({ 
    allowed, 
    atLimit, 
    loading = false, 
    onClick, 
    className = "", 
    children, 
    ...props 
}) {
    const isDisabled = loading || atLimit || !allowed;

    return (
        <button
            className={`${className} ${atLimit ? "restricted-btn" : ""}`}
            onClick={onClick}
            disabled={isDisabled}
            {...props}
        >
            {atLimit && !loading && <Lock size={16} className="m-r-2 inline-block relative -top-0.5" />}
            {children}
        </button>
    );
}
