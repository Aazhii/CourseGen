import toast from "react-hot-toast";

/**
 * Shows a toast-based delete confirmation.
 *
 * @param {{ title?: string, description?: string, onConfirm: () => Promise<void> }} options
 */
export function confirmDelete({ 
    title = "Delete this item?", 
    description = "This action cannot be undone.", 
    confirmText = "Delete", 
    confirmColor = "#ef4444", 
    onConfirm,
    secondaryText = null,
    secondaryColor = "var(--bg-secondary)",
    secondaryTextColor = "var(--text-primary)",
    onSecondary = null 
}) {
    toast((t) => (
        <div style={{ width: "100%", maxWidth: "900px", margin: "0 auto", textAlign: "center", padding: "0 35px" }}>
            <p style={{ margin: "0 0 10px", fontSize: "0.95rem", fontWeight: "600" }}>
                {title}
            </p>
            <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {description}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
                <button
                    style={{ padding: "6px 12px", background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: "500" }}
                    onClick={() => toast.dismiss(t.id)}
                >
                    Cancel
                </button>
                {secondaryText && onSecondary && (
                    <button
                        style={{ padding: "6px 12px", background: secondaryColor, color: secondaryTextColor, border: "1px solid var(--border-color)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "600" }}
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await onSecondary();
                        }}
                    >
                        {secondaryText}
                    </button>
                )}
                <button
                    style={{ padding: "6px 12px", background: confirmColor, color: "white", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: "600" }}
                    onClick={async () => {
                        toast.dismiss(t.id);
                        await onConfirm();
                    }}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    ));
}
