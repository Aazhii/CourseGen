import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { generateShareLink, getCourseShareLinks, revokeShareLink, deactivateShareLink, activateShareLink, sendDirectInvite } from "../../services/shareApi";
import { getCourseById, activateCourse, deactivateCourse } from "../../services/courseApi";
import { ChevronLeft, Copy, Trash2, Power, PowerOff, Loader2, Mail, Users, Calendar, Link as LinkIcon, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function SharingPage() {
    const { id: courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    
    // New link form
    const [linkType, setLinkType] = useState("PUBLIC");
    const [maxEnrollments, setMaxEnrollments] = useState("");
    const [expiryDays, setExpiryDays] = useState("");

    // Email invite form
    const [emails, setEmails] = useState("");
    const [sendingInvite, setSendingInvite] = useState(false);

    // Newly generated link
    const [newlyGeneratedLink, setNewlyGeneratedLink] = useState(null);

    useEffect(() => {
        loadData();
    }, [courseId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const courseData = await getCourseById(courseId);
            setCourse(courseData);
            
            const linksData = await getCourseShareLinks(courseId);
            setLinks(linksData || []);
        } catch (err) {
            toast.error("Failed to load sharing details.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setGenerating(true);
        try {
            let expiresAt = null;
            if (expiryDays) {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(expiryDays));
                expiresAt = date.toISOString();
            }

            const payload = {
                linkType,
                maxEnrollments: maxEnrollments ? parseInt(maxEnrollments) : null,
                expiresAt
            };

            const newLink = await generateShareLink(courseId, payload);
            setLinks([...links, newLink]);
            setNewlyGeneratedLink(newLink);
            toast.success("Share link generated!");
            
            // Reset form
            setMaxEnrollments("");
            setExpiryDays("");
        } catch (err) {
            toast.error("Failed to generate link.");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = (token) => {
        const url = `${window.location.origin}/join/${token}`;
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
    };

    const handleToggleStatus = async (linkId, isActive) => {
        try {
            if (isActive) {
                await deactivateShareLink(courseId, linkId);
                toast.success("Link deactivated");
            } else {
                await activateShareLink(courseId, linkId);
                toast.success("Link activated");
            }
            loadData(); // Reload to get updated status
        } catch (err) {
            toast.error(isActive ? "Failed to deactivate link" : "Failed to activate link");
        }
    };

    const handleRevoke = async (linkId) => {
        if (!window.confirm("Are you sure you want to delete this link?")) return;
        try {
            await revokeShareLink(courseId, linkId);
            toast.success("Link deleted");
            setLinks(links.filter(l => l.id !== linkId));
        } catch (err) {
            toast.error("Failed to delete link");
        }
    };

    const handleToggleCourseAccess = async () => {
        if (!course) return;
        try {
            if (course.active !== false) {
                if (!window.confirm("Are you sure you want to deactivate this course? Shared users will lose access.")) return;
                await deactivateCourse(courseId);
                toast.success("Course access deactivated.");
            } else {
                await activateCourse(courseId);
                toast.success("Course access restored.");
            }
            loadData();
        } catch (err) {
            toast.error("Failed to update course access status.");
        }
    };

    const handleSendInvite = async (e) => {
        e.preventDefault();
        if (!emails.trim()) return;
        
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e);
        if (emailList.length === 0) return;

        setSendingInvite(true);
        try {
            await sendDirectInvite(courseId, emailList);
            toast.success(`Invites sent to ${emailList.length} recipients`);
            setEmails("");
        } catch (err) {
            toast.error("Failed to send invites.");
        } finally {
            setSendingInvite(false);
        }
    };

    if (loading) return <div className="loading center"><Loader2 className="spin" size={40} /> Loading sharing settings...</div>;

    return (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "2rem" }}>
            <Link to={`/course/${courseId}`} className="back-link" style={{ marginBottom: "2rem", display: "inline-flex" }}>
                <ChevronLeft size={20} /> Back to Course
            </Link>

            <header style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h1 className="course-title-large">Share: {course?.title}</h1>
                    <p className="text-muted">Manage access and share links for your course.</p>
                </div>
                {course && (
                    <button 
                        className="auth-btn"
                        style={{ 
                            background: course.active !== false ? "var(--bg-secondary)" : "#ef4444", 
                            color: course.active !== false ? "var(--text-primary)" : "white",
                            border: course.active !== false ? "1px solid var(--border-color)" : "none",
                            display: "flex", alignItems: "center", gap: "8px" 
                        }}
                        onClick={handleToggleCourseAccess}
                        title={course.active !== false ? "Click to lock the course and prevent shared users from viewing it" : "Click to unlock"}
                    >
                        {course.active !== false ? <Power size={18} /> : <PowerOff size={18} />}
                        {course.active !== false ? "Deactivate Course" : "Activate Course"}
                    </button>
                )}
            </header>

            {course?.active === false && (
                <div style={{ padding: "1rem", marginBottom: "2rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "0.5rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "10px" }}>
                    <PowerOff size={20} />
                    <div>
                        <strong>Course Access Deactivated.</strong> 
                        <span style={{ display: "block", fontSize: "0.9rem", marginTop: "4px", color: "rgba(239, 68, 68, 0.8)" }}>Shared users cannot access this course until you activate it again.</span>
                    </div>
                </div>
            )}

            {newlyGeneratedLink && (
                <div style={{ marginBottom: "2rem", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "0.5rem", padding: "1.5rem" }}>
                    <h3 style={{ color: "#10b981", marginTop: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                        <CheckCircle size={20} /> Link Generated Successfully!
                    </h3>
                    <p style={{ margin: "1rem 0", fontSize: "1.1rem" }}>
                        Share this link with your students to grant them access to the course:
                    </p>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <code style={{ flex: 1, background: "var(--bg-primary)", padding: "1rem", borderRadius: "0.5rem", fontSize: "1.1rem" }}>
                            {window.location.origin}/join/{newlyGeneratedLink.shareToken}
                        </code>
                        <button 
                            className="auth-btn"
                            onClick={() => handleCopy(newlyGeneratedLink.shareToken)}
                            style={{ padding: "1rem 1.5rem", display: "flex", gap: "8px", alignItems: "center" }}
                        >
                            <Copy size={20} /> Copy
                        </button>
                    </div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
                
                {/* Link Generation Form */}
                <div style={{ background: "var(--bg-secondary)", padding: "2rem", borderRadius: "0.75rem", border: "1px solid var(--border-color)" }}>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <LinkIcon size={20} className="text-accent" /> Create Share Link
                    </h2>
                    <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Link Type</label>
                            <select 
                                value={linkType} 
                                onChange={(e) => setLinkType(e.target.value)}
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                            >
                                <option value="PUBLIC">Public (Anyone with link)</option>
                                <option value="RESTRICTED">Restricted</option>
                            </select>
                        </div>
                        
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Usage Limit</label>
                                <input 
                                    type="number" 
                                    placeholder="Unlimited" 
                                    value={maxEnrollments}
                                    onChange={(e) => setMaxEnrollments(e.target.value)}
                                    min="1"
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Expires in (Days)</label>
                                <input 
                                    type="number" 
                                    placeholder="Never" 
                                    value={expiryDays}
                                    onChange={(e) => setExpiryDays(e.target.value)}
                                    min="1"
                                    style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="auth-btn" 
                            disabled={generating}
                            style={{ marginTop: "1rem", width: "100%", padding: "0.75rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                        >
                            {generating ? <Loader2 className="spin" size={18} /> : null}
                            Generate Link
                        </button>
                    </form>
                </div>

                {/* Email Invite Form */}
                <div style={{ background: "var(--bg-secondary)", padding: "2rem", borderRadius: "0.75rem", border: "1px solid var(--border-color)" }}>
                    <h2 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Mail size={20} className="text-accent" /> Direct Email Invite
                    </h2>
                    <p className="text-muted" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
                        Send course invitations directly to users' email addresses. Separate multiple emails with commas.
                    </p>
                    <form onSubmit={handleSendInvite} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <textarea 
                                placeholder="e.g. user1@example.com, user2@example.com"
                                value={emails}
                                onChange={(e) => setEmails(e.target.value)}
                                rows="3"
                                style={{ width: "100%", padding: "0.75rem", borderRadius: "0.5rem", background: "var(--bg-primary)", border: "1px solid var(--border-color)", color: "var(--text-primary)", resize: "vertical" }}
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="auth-btn" 
                            disabled={sendingInvite || !emails.trim()}
                            style={{ marginTop: "auto", width: "100%", padding: "0.75rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                        >
                            {sendingInvite ? <Loader2 className="spin" size={18} /> : null}
                            Send Invites
                        </button>
                    </form>
                </div>

            </div>

            {/* Active Links Table */}
            <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Active Share Links</h2>
                {links.length === 0 ? (
                    <div style={{ padding: "3rem", textAlign: "center", background: "var(--bg-secondary)", borderRadius: "0.75rem", border: "1px dashed var(--border-color)" }}>
                        <p className="text-muted">No share links generated yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--bg-secondary)", borderRadius: "0.75rem", overflow: "hidden" }}>
                            <thead style={{ background: "rgba(0,0,0,0.2)", textAlign: "left" }}>
                                <tr>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: "500" }}>Token</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: "500" }}>Type</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: "500" }}>Uses</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: "500" }}>Status</th>
                                    <th style={{ padding: "1rem", color: "var(--text-secondary)", fontWeight: "500", textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {links.map(link => (
                                    <tr key={link.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                                        <td style={{ padding: "1rem", fontFamily: "monospace" }}>{(link.shareToken || link.token || "").substring(0,8)}...</td>
                                        <td style={{ padding: "1rem" }}>
                                            <span style={{ 
                                                padding: "0.25rem 0.5rem", 
                                                borderRadius: "4px", 
                                                fontSize: "0.8rem", 
                                                background: link.linkType === 'PUBLIC' ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                                color: link.linkType === 'PUBLIC' ? "#10b981" : "#f59e0b"
                                            }}>
                                                {link.linkType}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                                            {link.currentEnrollments || 0} / {link.maxEnrollments ? link.maxEnrollments : "∞"}
                                        </td>
                                        <td style={{ padding: "1rem" }}>
                                            <span style={{ 
                                                padding: "0.25rem 0.5rem", 
                                                borderRadius: "4px", 
                                                fontSize: "0.8rem", 
                                                background: link.isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                                                color: link.isActive ? "#34d399" : "#f87171"
                                            }}>
                                                {link.isActive ? "ACTIVE" : "INACTIVE"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "1rem", display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                                            <button 
                                                onClick={() => handleCopy(link.shareToken || link.token)}
                                                style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.25rem" }}
                                                title="Copy Link"
                                            >
                                                <Copy size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(link.id, link.isActive)}
                                                style={{ background: "transparent", border: "none", color: link.isActive ? "#f59e0b" : "#10b981", cursor: "pointer", padding: "0.25rem" }}
                                                title={link.isActive ? "Deactivate" : "Activate"}
                                            >
                                                <Power size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleRevoke(link.id)}
                                                style={{ background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
