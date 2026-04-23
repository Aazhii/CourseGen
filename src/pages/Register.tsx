import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { register as apiRegister } from "@/services/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Github, Mail, Sparkles, UserPlus, ShieldCheck } from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ParticleField } from "@/components/ParticleField";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePattern = /^[a-z0-9._]{6,25}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (!handlePattern.test(username.trim())) {
      toast.error("User ID must be 6-25 characters and use only lowercase letters, numbers, '.' or '_' .");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const resp = await apiRegister({
        username: username.trim(),
        displayName: displayName.trim() || undefined,
        password,
      });
      
      const data = resp?.data ?? resp;
      if (data && data.token) {
        auth.login(data.token, data.user);
        toast.success("Account created! Welcome 🎉");
        navigate("/dashboard");
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AmbientBackground />
      <ParticleField influence={140} density={0.0001} />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-2">
        {/* Left: brand panel */}
        <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14">
          <Logo />

          <div className="max-w-lg space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              <span className="text-muted-foreground font-medium uppercase tracking-[0.05em] text-[10px]">AI-native learning platform</span>
            </div>
            <h1 className="font-display text-4xl xl:text-6xl font-bold leading-[1.05] tracking-tight text-white">
              Start your <br />
              <span className="text-accent">learning journey</span> <br />
              <span className="text-primary italic">today</span>.
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Create an account to join the world's fastest growing AI-powered curriculum platform. 
              Build, learn, and grow at the speed of thought.
            </p>

            <div className="grid grid-cols-1 gap-6 pt-4">
               {[
                  { icon: ShieldCheck, title: "Enterprise grade security", desc: "Your data is encrypted and secure." },
                  { icon: Sparkles, title: "Infinite course generation", desc: "Never hit a learning wall again." }
               ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                     <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03] border border-white/10 shrink-0">
                        <item.icon className="h-5 w-5 text-accent" />
                     </span>
                     <div>
                        <div className="text-sm font-bold text-white tracking-tight">{item.title}</div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</div>
                     </div>
                  </div>
               ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-medium opacity-60 italic">
            Built for modern learners, by modern learners.
          </p>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center p-6 sm:p-10 relative">
          <div className="w-full max-w-md relative z-10">
            <div className="lg:hidden mb-12 flex justify-center sticky top-0">
              <Logo />
            </div>

            <div className="glass-strong rounded-[2.5rem] p-8 sm:p-12 shadow-2xl border border-white/5 relative overflow-hidden backdrop-blur-2xl">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="space-y-2 relative z-10">
                <h2 className="font-display text-3xl font-bold tracking-tight text-white">Create Account</h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Join AI CourseGen and start learning.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 mt-10 relative z-10">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Display Name</label>
                   <Input
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={loading}
                    className="h-12 bg-white/[0.02] border-white/5 rounded-2xl focus-visible:ring-primary/20 transition-all font-medium"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">User ID</label>
                   <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
                    <Input
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="choose_a_user_id"
                      className="h-12 pl-11 bg-white/[0.02] border-white/5 rounded-2xl focus-visible:ring-primary/20 transition-all font-medium"
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 pl-1 uppercase tracking-tighter">6-25 chars, lowercase, numbers, '.' or '_'</p>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Password</label>
                   <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-12 pr-12 bg-white/[0.02] border-white/5 rounded-2xl focus-visible:ring-primary/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-white/5 hover:text-white transition-all"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground pl-1">Confirm Password</label>
                   <Input
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-white/[0.02] border-white/5 rounded-2xl focus-visible:ring-primary/20 transition-all"
                   />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full h-14 rounded-2xl font-bold uppercase tracking-widest text-xs mt-4 shadow-[0_4px_20px_-5px_rgba(168,85,247,0.4)]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Creating account...
                    </div>
                  ) : "Create Account"}
                </Button>
              </form>

              <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
                <Button variant="glass" type="button" className="h-12 border-white/5 hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest">
                  <GoogleIcon /> Google
                </Button>
                <Button variant="glass" type="button" className="h-12 border-white/5 hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest">
                  <Github className="h-4 w-4" /> GitHub
                </Button>
              </div>

              <p className="mt-10 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground relative z-10">
                Already have an account?{" "}
                <Link to="/login" className="text-white hover:text-primary transition-colors">
                  Sign in
                </Link>
              </p>
            </div>

            <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              <Link to="/" className="hover:text-white transition-colors flex items-center justify-center gap-2">
                ← Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 mr-2" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.7 2.5 2.5 6.7 2.5 12s4.2 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
