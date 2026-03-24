import React from "react";
import { Loader2 } from "lucide-react";
import FeatureRestrictedButton from "../../../components/FeatureRestrictedButton";

export default function CourseSubmitAction({ loading, atLimit, allowed, featureLoading }) {
    return (
        <FeatureRestrictedButton 
            className="submit-btn generate-btn" 
            allowed={allowed}
            atLimit={atLimit}
            loading={loading || featureLoading}
        >
            {loading ? (
                <>
                    <Loader2 className="spin" size={20} /> Generating...
                </>
            ) : (
                "Generate Course"
            )}
        </FeatureRestrictedButton>
    );
}
