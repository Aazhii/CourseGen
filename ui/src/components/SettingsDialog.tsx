import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Settings,
  Globe,
  CreditCard,
  Users as UsersIcon,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Mail,
  Lock,
  LogOut
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: string;
}

export function SettingsDialog({ open, onOpenChange, initialTab = "account" }: SettingsDialogProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync active tab with dropdown trigger selection
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  if (!user) return null;

  const displayName = user.displayName ?? user.username ?? "User";
  const identifier = user.username ?? user.id ?? "user";
  const email = user.email;
  const avatarLetter = displayName[0]?.toUpperCase() ?? "U";

  const sidebarItems = [
    { id: "account", label: "Account info", icon: User, group: "User settings" },
    { id: "preferences", label: "Preferences", icon: Settings, group: "User settings" },
    { id: "general", label: "General", icon: Globe, group: "Workspace settings" },
    { id: "publishing", label: "Publishing", icon: Sparkles, group: "Workspace settings", badge: true },
    { id: "billing", label: "Billing", icon: CreditCard, group: "Workspace settings" },
    { id: "users", label: "Users", icon: UsersIcon, group: "Workspace settings", badge: true },
  ];

  const groups = Array.from(new Set(sidebarItems.map(item => item.group)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1000px] p-0 gap-0 bg-background border-border overflow-hidden h-[90vh] md:h-[700px]">
        <div className="flex h-full w-full">
          {/* Sidebar */}
          <aside className="w-64 border-r border-border bg-muted/20 hidden md:flex flex-col shrink-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group} className="space-y-1">
                    <h3 className="px-2 text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest mb-2">
                      {group}
                    </h3>
                    {sidebarItems.filter(item => item.group === group).map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group",
                          activeTab === item.id
                            ? "bg-muted text-foreground font-semibold shadow-sm"
                            : "text-muted-foreground font-medium hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <item.icon className={cn(
                          "w-4 h-4 transition-transform group-hover:scale-110",
                          activeTab === item.id ? "text-foreground" : "text-muted-foreground/60 group-hover:text-foreground/80"
                        )} />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <div className="h-4 w-4 rounded bg-primary/20 flex items-center justify-center">
                            <Sparkles className="w-2.5 h-2.5 text-primary" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-3 font-semibold"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 flex flex-col min-w-0 bg-background h-full">
            <ScrollArea className="flex-1 h-full">
              <div className="p-8 max-w-2xl mx-auto space-y-10">
                {activeTab === "account" && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-5">
                      <Avatar className="h-16 w-16 rounded-2xl border-2 border-background shadow-soft shrink-0">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-gradient-cta text-white text-xl font-bold">
                          {avatarLetter}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{displayName}</h2>
                        <p className="text-sm text-muted-foreground font-medium">@{user.username || identifier}</p>
                      </div>
                    </div>

                    <Separator className="bg-border/60" />

                    <div className="space-y-1">
                      <h3 className="text-lg font-bold tracking-tight">Account information</h3>
                      <p className="text-sm text-muted-foreground font-medium">Manage your profile details and private information.</p>
                    </div>

                    {/* Profile Picture */}
                    <div className="space-y-4">
                      <Label className="text-sm font-bold">Profile picture</Label>
                      <div className="flex items-center gap-6">
                        <Avatar className="h-20 w-20 rounded-2xl border-2 border-background shadow-soft">
                          <AvatarImage src={user.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-cta text-white text-2xl font-bold">
                            {avatarLetter}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline" className="font-bold rounded-lg border-border/50 hover:bg-muted/80">Change picture</Button>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">JPG, GIF or PNG. Max size 2MB.</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold flex items-center gap-2">
                          Email address <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                        </Label>
                        <Input
                          defaultValue={email}
                          disabled
                          className="bg-muted/30 border-border/40 font-medium cursor-not-allowed opacity-80"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">First name</Label>
                          <Input defaultValue={user.displayName?.split(" ")[0]} className="bg-muted/10 border-border/40 focus:ring-primary/20" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Last name</Label>
                          <Input defaultValue={user.displayName?.split(" ")[1]} placeholder="Your last name" className="bg-muted/10 border-border/40 focus:ring-primary/20" />
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Security */}
                    <div className="space-y-4 pt-2">
                      <h3 className="text-base font-bold">Password and authentication</h3>
                      <div className="p-5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                        <div className="space-y-1">
                          <p className="text-sm font-bold">Change password</p>
                          <p className="text-xs text-muted-foreground font-medium">Update your account password for better security.</p>
                        </div>
                        <Button variant="hero" size="sm" className="h-8 rounded-lg shadow-soft font-bold px-4">Change password</Button>
                      </div>
                    </div>

                    <Separator className="bg-border/60" />

                    {/* Dangerous Logout */}
                    <div className="space-y-4 pt-2 pb-10">
                      <h3 className="text-base font-bold text-destructive/80">Log out from all devices</h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        You will be logged out of all active sessions besides this one and will have to log back in.
                      </p>
                      <Button variant="ghost" className="text-destructive font-bold hover:bg-destructive/10">Log out</Button>
                    </div>
                  </div>
                )}

                {activeTab !== "account" && (
                  <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                    <Settings className="w-12 h-12 mb-4 animate-pulse" />
                    <p className="font-black uppercase tracking-[0.2em] text-[10px]">Module Pending Implementation</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
