import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { fetchInviteSummary } from "../../../services/inviteApi";
import NotificationPanel from "./NotificationPanel";
import "./notification.css";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const loadSummary = async () => {
    try {
      const data = await fetchInviteSummary();
      if (data && data.pendingInvitesCount !== undefined) {
        setUnreadCount(data.pendingInvitesCount);
      }
    } catch (err) {
      console.error("Failed to fetch invite summary", err);
    }
  };

  useEffect(() => {
    loadSummary();
    // Setup polling or trigger on events if necessary
  }, []);

  // Close panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Refresh count when opening
      loadSummary();
    }
  };

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button className="notification-bell-btn" onClick={togglePanel}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {isOpen && (
        <NotificationPanel 
          onClose={() => setIsOpen(false)} 
          onUpdateCount={loadSummary} 
        />
      )}
    </div>
  );
}
