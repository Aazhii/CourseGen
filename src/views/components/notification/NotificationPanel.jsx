import React, { useState, useEffect } from "react";
import { 
  fetchSharedWithMeInvites, 
  markAllInvitesRead, 
  markInviteRead,
  acceptInvite,
  declineInvite
} from "../../../services/inviteApi";
import { Check, X } from "lucide-react";

export default function NotificationPanel({ onClose, onUpdateCount }) {
  const [filter, setFilter] = useState("All"); // "All" | "Unread"
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define loadInvites inside the component so we can use it properly
  const loadInvites = async () => {
    setLoading(true);
    try {
      const data = await fetchSharedWithMeInvites();
      if (data) {
        // Sort by enrolledAt descending (newest first)
        const sorted = data.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));
        setInvites(sorted);
      }
    } catch (err) {
      console.error("Failed to load invites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllInvitesRead();
      await loadInvites();
      if (onUpdateCount) onUpdateCount();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleNotificationClick = async (invite) => {
    if (!invite.isRead) {
      try {
        await markInviteRead(invite.id);
        
        // Update local state and count
        setInvites(invites.map(i => i.id === invite.id ? { ...i, isRead: true } : i));
        if (onUpdateCount) onUpdateCount();
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }
  };

  const handleAction = async (e, action, inviteId) => {
    e.stopPropagation(); // prevent triggering row click
    try {
      if (action === "accept") {
        await acceptInvite(inviteId);
      } else if (action === "decline") {
        await declineInvite(inviteId);
      }
      // Refresh list
      await loadInvites();
      if (onUpdateCount) onUpdateCount();
    } catch (err) {
      console.error(`Failed to ${action} invite`, err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const filteredInvites = invites.filter(inv => {
    if (filter === "Unread") return !inv.isRead;
    return true;
  });

  const getInitials = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  const unreadCount = invites.filter(i => !i.isRead).length;

  return (
    <div className="notification-panel fade-up">
      <div className="notification-header">
        <div className="notification-tabs">
          <button 
            className={`tab-btn ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          <button 
            className={`tab-btn ${filter === "Unread" ? "active" : ""}`}
            onClick={() => setFilter("Unread")}
          >
            Unread {unreadCount > 0 && <span className="tab-badge">{unreadCount}</span>}
          </button>
        </div>
        <button className="close-panel-btn" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="notification-body">
        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : filteredInvites.length === 0 ? (
          <div className="empty-notifications">
            <p>No notifications to show</p>
          </div>
        ) : (
          filteredInvites.map((invite) => (
            <div 
              key={invite.id} 
              className={`notification-item ${!invite.isRead ? "unread" : ""}`}
              onClick={() => handleNotificationClick(invite)}
            >
              <div className="notification-avatar" style={{ backgroundColor: `hsl(${invite.invitedBy * 40 % 360}, 60%, 70%)` }}>
                {getInitials(invite.invitedByName)}
              </div>
              <div className="notification-content">
                <p className="notification-text">
                  <span className="notif-user">{invite.invitedByName || "Someone"}</span> invited you to join the course <span className="notif-course">"{invite.courseName}"</span>
                </p>
                <span className="notification-time">{formatDate(invite.enrolledAt)}</span>
                
                {invite.inviteStatus === "PENDING" && (
                  <div className="notification-actions">
                    <button 
                      className="btn-accept" 
                      onClick={(e) => handleAction(e, "accept", invite.id)}
                    >
                      Enroll
                    </button>
                    <button 
                      className="btn-decline" 
                      onClick={(e) => handleAction(e, "decline", invite.id)}
                    >
                      Decline
                    </button>
                  </div>
                )}
                {invite.inviteStatus === "ACCEPTED" && (
                  <p className="status-text success"><Check size={12} style={{marginRight: '4px'}} /> Enrolled</p>
                )}
                {invite.inviteStatus === "DECLINED" && (
                  <p className="status-text declined"><X size={12} style={{marginRight: '4px'}} /> Declined</p>
                )}
              </div>
              {!invite.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      <div className="notification-footer">
        <button className="mark-read-btn" onClick={handleMarkAllRead}>
          Mark all as Read
        </button>
      </div>
    </div>
  );
}
