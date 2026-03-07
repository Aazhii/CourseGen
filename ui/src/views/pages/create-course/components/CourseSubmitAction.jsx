import React from "react";
import { Loader2 } from "lucide-react";

export default function CourseSubmitAction({ loading }) {
    return (
        <button className="submit-btn generate-btn" disabled={loading}>
            {loading ? (
                <>
                    <Loader2 className="spin" size={20} /> Generating...
                </>
            ) : (
                "Generate Course"
            )}
        </button>
    );
}
