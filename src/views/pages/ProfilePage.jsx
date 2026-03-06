import React, { useState, useEffect } from "react";
import { User, Lock, ChevronRight, ArrowLeft, Loader2, Shield, AtSign, Calendar, Award, Zap, BookOpen, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getProfile, updateProfile, changePassword } from "../../services/aboutApi";
import { useAuth } from "../../auth/AuthContext";

export default function ProfilePage() {
  const { user: authUser } = useAuth(); // Has minimal info like {username, roles}
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Views: 'list' | 'edit-name' | 'edit-password'
  const [currentView, setCurrentView] = useState("list");
  
  // Form State
  const [newUsername, setNewUsername] = useState("");
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
      setNewUsername(data.username || "");
    } catch (err) {
      console.error("Failed to load profile for settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      toast.error("Display Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateProfile(newUsername);
      setProfile(updated);
      toast.success("Display Name updated successfully.");
      setTimeout(() => {
          setCurrentView("list");
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Failed to update Display Name.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setSaving(true);
      await changePassword(pwdForm.currentPassword, pwdForm.newPassword, pwdForm.confirmPassword);
      toast.success("Password changed successfully.");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => {
          setCurrentView("list");
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) {
    return (
        <div className="dashboard-content center" style={{ paddingTop: '5rem' }}>
            <Loader2 className="spin" size={40} color="var(--accent)" />
        </div>
    );
  }

  const stats = profile?.stats || {};
  const rolesString = Array.isArray(profile?.roles) ? profile.roles.join(', ') : 'USER';
  const joinedDate = profile?.createdAt 
        ? new Date(profile.createdAt).toLocaleDateString(undefined, {
            year: 'numeric', month: 'long', day: 'numeric'
        }) 
        : "Unknown";

  return (
    <div className="dashboard-content profile-page">
      <header className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title"><User size={28} className="icon-accent" /> Profile & Settings</h1>
          <p className="page-subtitle">Manage your account details and view your learning statistics.</p>
        </div>
      </header>

      <div className="profile-grid">
        
        {/* Left Column: Identity & Stats */}
        <div className="profile-left-col">
            <div className="identity-card fade-up">
                <div className="avatar-circle">
                    <span className="avatar-initial">{profile?.username?.charAt(0).toUpperCase() || authUser?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <h2 className="identity-name">{profile?.username || authUser?.username}</h2>
                <div className="identity-badges">
                    <span className="badge role-badge"><Shield size={14} /> {rolesString}</span>
                </div>
                <div className="identity-meta">
                    <p className="meta-item"><AtSign size={16}/> @{(profile?.username || authUser?.username || "").toLowerCase().replace(/\s/g, '')}</p>
                    <p className="meta-item"><Calendar size={16}/> Joined {joinedDate}</p>
                </div>
            </div>

            <div className="stats-overview fade-up" style={{ animationDelay: '0.1s' }}>
                <h3 className="section-title">Learning Stats</h3>
                <div className="stats-grid">
                    <div className="stat-box">
                        <Award className="stat-icon text-gold" size={24} />
                        <div className="stat-value">{stats.totalPoints || 0}</div>
                        <div className="stat-label">Total Points</div>
                    </div>
                    <div className="stat-box">
                        <Zap className="stat-icon text-orange" size={24} />
                        <div className="stat-value">{stats.currentStreak || 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-box">
                        <BookOpen className="stat-icon text-blue" size={24} />
                        <div className="stat-value">{stats.coursesCompleted || 0}</div>
                        <div className="stat-label">Courses Done</div>
                    </div>
                    <div className="stat-box">
                        <CheckCircle className="stat-icon text-green" size={24} />
                        <div className="stat-value">{stats.lessonsCompleted || 0}</div>
                        <div className="stat-label">Lessons Done</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Settings Interaction */}
        <div className="profile-right-col">
            <div className="settings-page-container fade-up" style={{ animationDelay: '0.2s', margin: 0, width: '100%', maxWidth: 'none', paddingTop: 0 }}>
                
                {/* Header */}
                <div className="settings-page-header">
                {currentView !== "list" ? (
                    <button className="settings-back-btn" onClick={() => {
                        setCurrentView("list");
                    }}>
                    <ArrowLeft size={20} /> <span style={{marginLeft: '0.5rem'}}>Back</span>
                    </button>
                ) : (
                    <div>
                    <h2 className="settings-page-title">Edit Profile</h2>
                    <p className="settings-subtitle" style={{marginBottom: 0}}>Manage your basic profile information.</p>
                    </div>
                )}
                
                {currentView !== "list" && (
                    <h2 className="settings-page-title inline-title">
                    {currentView === "edit-name" && "Edit Display Name"}
                    {currentView === "edit-password" && "Change Password"}
                    </h2>
                )}
                </div>

                {/* Content Body */}
                <div className="settings-page-body">
                {currentView === "list" ? (
                    <div className="settings-list">
                    <div 
                        className="settings-list-item" 
                        onClick={() => {
                        setNewUsername(profile?.username || authUser?.username);
                        setCurrentView("edit-name");
                        }}
                    >
                        <div className="settings-item-left">
                        <User size={20} className="settings-item-icon" />
                        <span className="settings-item-label">Display Name</span>
                        <span className="settings-item-value">{profile?.username || authUser?.username}</span>
                        </div>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </div>

                    <div 
                        className="settings-list-item"
                        onClick={() => {
                        setCurrentView("edit-password");
                        }}
                    >
                        <div className="settings-item-left">
                        <Lock size={20} className="settings-item-icon" />
                        <span className="settings-item-label">Password</span>
                        <span className="settings-item-value">••••••••</span>
                        </div>
                        <ChevronRight size={20} className="settings-item-arrow" />
                    </div>
                    </div>
                ) : currentView === "edit-name" ? (
                    <div className="settings-form-container">
                        <form className="settings-form" onSubmit={handleUpdateUsername}>
                            <div className="form-group">
                                <label>Display Name</label>
                                <input 
                                    type="text" 
                                    value={newUsername} 
                                    onChange={(e) => setNewUsername(e.target.value)} 
                                    required 
                                    autoFocus
                                />
                            </div>
                            
                            <button className="submit-btn" disabled={saving}>
                                {saving ? <Loader2 className="spin" size={18}/> : "Save Changes"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="settings-form-container">
                        <form className="settings-form" onSubmit={handleChangePassword}>
                            <div className="form-group">
                                <label>Current Password</label>
                                <input 
                                    type="password" 
                                    value={pwdForm.currentPassword} 
                                    onChange={(e) => setPwdForm({...pwdForm, currentPassword: e.target.value})} 
                                    required 
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={pwdForm.newPassword} 
                                    onChange={(e) => setPwdForm({...pwdForm, newPassword: e.target.value})} 
                                    required 
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    value={pwdForm.confirmPassword} 
                                    onChange={(e) => setPwdForm({...pwdForm, confirmPassword: e.target.value})} 
                                    required 
                                    minLength={6}
                                />
                            </div>
                            
                            <button className="submit-btn" disabled={saving}>
                                {saving ? <Loader2 className="spin" size={18}/> : "Change Password"}
                            </button>
                        </form>
                    </div>
                )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
