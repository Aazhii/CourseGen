import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useFeature } from "@/hooks/useFeature";
import {
  fetchLlmProviderHealth,
  fetchLlmProviders,
  fetchLlmRoutes,
  upsertLlmProvider,
  upsertLlmRoute,
  type LlmProvider,
  type ProviderType,
  type WorkloadType,
} from "@/services/llmAdminApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Settings, 
  Server, 
  Zap, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Clock,
  Database,
  Info,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const WORKLOADS: WorkloadType[] = ["COURSE_GENERATION", "LESSON_GENERATION", "AI_COACH"];

export default function LlmAdmin() {
  const adminFeature = useFeature("ADMIN_PANEL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [healthPollStartedAt] = useState<number>(Date.now());
  const [lastHealthPollSuccessAt, setLastHealthPollSuccessAt] = useState<number | null>(null);
  const [healthClockTick, setHealthClockTick] = useState<number>(Date.now());
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [routes, setRoutes] = useState<Record<WorkloadType, string>>({
    COURSE_GENERATION: "",
    LESSON_GENERATION: "",
    AI_COACH: "",
  });
  const [error, setError] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    code: "",
    displayName: "",
    providerType: "GEMINI" as ProviderType,
    modelName: "",
    baseUrl: "",
    keyCooldownHours: 24,
    enabled: true,
    apiKeysText: "",
  });

  const providerCodes = useMemo(() => providers.map((p) => p.code), [providers]);
  const staleReference = lastHealthPollSuccessAt ?? healthPollStartedAt;
  const isHealthStale = !loading && healthClockTick - staleReference > 45_000;

  useEffect(() => {
    if (adminFeature.loading || !adminFeature.allowed) {
      return;
    }
    refreshAll();
  }, [adminFeature.loading, adminFeature.allowed]);

  useEffect(() => {
    if (adminFeature.loading || !adminFeature.allowed) {
      return;
    }

    let active = true;
    const pollHealth = async () => {
      setHealthClockTick(Date.now());
      try {
        const snapshots = await fetchLlmProviderHealth();
        if (!active) return;

        setProviders((prev) =>
          prev.map((provider) => {
            const snapshot = snapshots.find((entry) => entry.providerCode === provider.code);
            if (!snapshot) return provider;
            return {
              ...provider,
              activeKeyCount: snapshot.activeKeyCount,
              coolingDownKeyCount: snapshot.coolingDownKeyCount,
              lastError: snapshot.lastError ?? null,
              lastErrorAt: snapshot.lastErrorAt ?? null,
              lastSuccessAt: snapshot.lastSuccessAt ?? null,
            };
          })
        );
        const now = Date.now();
        setLastHealthPollSuccessAt(now);
        setHealthClockTick(now);
      } catch {
        // Keep polling silent
      }
    };

    const intervalId = window.setInterval(pollHealth, 15000);
    pollHealth();

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [adminFeature.loading, adminFeature.allowed]);

  async function refreshAll() {
    setLoading(true);
    setError("");
    try {
      const [providerList, routeList] = await Promise.all([fetchLlmProviders(), fetchLlmRoutes()]);
      setProviders(providerList);
      const mapped: Record<WorkloadType, string> = {
        COURSE_GENERATION: "",
        LESSON_GENERATION: "",
        AI_COACH: "",
      };
      routeList.forEach((r) => {
        mapped[r.workload] = r.providerCode;
      });
      setRoutes(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load LLM settings";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function saveProvider() {
    setSaving(true);
    setError("");
    try {
      const apiKeys = form.apiKeysText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const payload: any = {
        code: form.code,
        displayName: form.displayName,
        providerType: form.providerType,
        modelName: form.modelName,
        baseUrl: form.baseUrl || undefined,
        keyCooldownHours: form.keyCooldownHours,
        enabled: form.enabled,
      };

      if (apiKeys.length > 0) {
        payload.apiKeys = apiKeys;
      } else if (!isEditing) {
        payload.apiKeys = [];
      }

      await upsertLlmProvider(payload);
      
      toast.success(`Provider "${form.displayName}" ${isEditing ? "updated" : "created"} successfully`);
      await refreshAll();
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to save provider";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function saveRoute(workload: WorkloadType, providerCode: string) {
    if (!providerCode) return;
    setSaving(true);
    try {
      await upsertLlmRoute(workload, providerCode);
      setRoutes(prev => ({ ...prev, [workload]: providerCode }));
      toast.success(`Route for ${workload.replace("_", " ")} updated`);
    } catch (e) {
      toast.error("Failed to update route");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({
      code: "",
      displayName: "",
      providerType: "GEMINI",
      modelName: "",
      baseUrl: "",
      keyCooldownHours: 24,
      enabled: true,
      apiKeysText: "",
    });
    setIsEditing(false);
  }

  function handleEditProvider(provider: LlmProvider) {
    setForm({
      code: provider.code,
      displayName: provider.displayName,
      providerType: provider.providerType,
      modelName: provider.modelName,
      baseUrl: provider.baseUrl || "",
      keyCooldownHours: provider.keyCooldownHours,
      enabled: provider.enabled,
      apiKeysText: "", 
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  }

  if (adminFeature.loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  if (!adminFeature.allowed) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">LLM Operations</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Manage provider pools, key health, and workload routing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-background/50 text-xs font-medium transition-colors duration-500",
            isHealthStale ? "text-amber-500 border-amber-500/30" : "text-emerald-500 border-emerald-500/30"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isHealthStale ? "bg-amber-500" : "bg-emerald-500",
              !isHealthStale && "animate-pulse"
            )} />
            {isHealthStale ? "Health Stale" : "System Healthy"}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshAll} 
            disabled={loading}
            className="shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="routing" className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="bg-muted/50 p-1 border">
            <TabsTrigger value="routing" className="gap-2">
              <Zap className="w-4 h-4" />
              Intelligence Routing
            </TabsTrigger>
            <TabsTrigger value="providers" className="gap-2">
              <Server className="w-4 h-4" />
              Provider Registry
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="routing" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WORKLOADS.map((workload) => {
              const currentProvider = providers.find(p => p.code === routes[workload]);
              return (
                <Card key={workload} className="overflow-hidden border-border/60 hover:border-primary/50 transition-colors group">
                  <div className="h-1 bg-gradient-to-r from-primary/80 to-primary/20" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider font-bold">Workload</Badge>
                      <Database className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <CardTitle className="text-xl capitalize">{workload.replace("_", " ").toLowerCase()}</CardTitle>
                    <CardDescription>Target provider for this task</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-2">
                      <Label className="text-[11px] text-muted-foreground uppercase">Active Provider</Label>
                      <Select 
                        value={routes[workload] || "_none"} 
                        onValueChange={(val) => saveRoute(workload, val === "_none" ? "" : val)}
                        disabled={loading || saving}
                      >
                        <SelectTrigger className="w-full bg-background/50 font-medium">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="_none" className="text-muted-foreground">Select provider</SelectItem>
                          {providers.filter(p => p.enabled).map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold">{p.displayName}</span>
                                <span className="text-[11px] text-muted-foreground">({p.modelName})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentProvider && (
                      <div className="flex items-center gap-4 px-1">
                        <div className="text-center">
                          <div className="text-lg font-bold text-primary">{currentProvider.activeKeyCount}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-medium">Ready Keys</div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-lg font-bold text-amber-500">{currentProvider.coolingDownKeyCount}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-medium">Cooldown</div>
                        </div>
                        <div className="ml-auto">
                          {currentProvider.lastSuccessAt ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6 mt-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground/80">
              <Database className="w-5 h-5" />
              Configured Pools
              <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground">{providers.length}</Badge>
            </h2>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
               setIsDialogOpen(open);
               if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  Register Provider
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-xl max-h-[85vh] p-0 flex flex-col border-border/80 shadow-2xl backdrop-blur-md overflow-hidden">
                <DialogHeader className="p-8 pb-4 bg-muted/10 border-b relative">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                      <Server className="w-6 h-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
                        {isEditing ? "Update Provider Pool" : "Register New Provider"}
                      </DialogTitle>
                      <DialogDescription className="text-[13px] mt-1 text-muted-foreground font-medium italic">
                        Configure architecture specs and key rotation parameters.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3">
                      <span className="p-1 rounded bg-primary/10">
                         <Info className="w-4 h-4 text-primary" />
                      </span>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Provider Identity Info</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="code" className="text-[12px] font-bold text-foreground/70 uppercase">Immutable System Code</Label>
                        <Input 
                          id="code" 
                          placeholder="e.g. vertex-prod-01" 
                          className="bg-background h-10 border-border/60 font-mono shadow-inner text-foreground/80"
                          value={form.code} 
                          onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                          disabled={isEditing}
                        />
                        <p className="text-[10px] text-muted-foreground/60 px-1 font-bold italic">Critical system identifier for routing architecture.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-[12px] font-bold text-foreground/70 uppercase">Dashboard Public Name</Label>
                        <Input 
                          id="displayName" 
                          placeholder="e.g. Google Vertex AI" 
                          className="bg-background h-10 border-border/60 shadow-sm"
                          value={form.displayName} 
                          onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-2 border-b border-border/40 pb-3 font-semibold">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Technical Specification</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-2">
                        <Label className="text-[12px] font-bold text-foreground/70 uppercase">Infrastructure Layer</Label>
                        <Select 
                          value={form.providerType} 
                          onValueChange={v => setForm(f => ({ ...f, providerType: v as ProviderType }))}
                        >
                          <SelectTrigger className="bg-background h-10 border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GEMINI" className="py-2.5">
                              <div className="flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                <span className="font-semibold">Google Vertex / AI Studio</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="GROQ" className="py-2.5">
                              <div className="flex items-center gap-2">
                                <Zap className="w-3.5 h-3.5 text-orange-500" />
                                <span className="font-semibold">Groq LPU Inference</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modelName" className="text-[12px] font-bold text-foreground/70 uppercase tracking-tight">Intelligence Engine ID</Label>
                        <Input 
                          id="modelName" 
                          placeholder="e.g. gemini-1.5-pro-latest" 
                          className="bg-background h-10 font-mono text-[12px] border-border/60 shadow-sm"
                          value={form.modelName} 
                          onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="baseUrl" className="text-[12px] font-bold text-foreground/70 uppercase">Gateway Override (URL)</Label>
                        <Input 
                          id="baseUrl" 
                          placeholder="Default System Endpoint" 
                          className="bg-background h-10 text-[12px] border-border/60 shadow-sm"
                          value={form.baseUrl} 
                          onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cooldown" className="text-[12px] font-bold text-foreground/70 uppercase">Recovery Cooldown (Hrs)</Label>
                        <div className="relative">
                          <Input 
                            id="cooldown" 
                            type="number" 
                            className="bg-background h-10 pr-12 border-border/60 shadow-sm font-mono text-[13px]"
                            value={form.keyCooldownHours} 
                            onChange={e => setForm(f => ({ ...f, keyCooldownHours: parseInt(e.target.value) }))}
                          />
                          <Clock className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/20" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl border bg-muted/30 mt-6 group hover:border-primary/20 transition-all duration-300 shadow-sm">
                      <div className="space-y-0.5">
                        <Label className="text-[14px] font-bold tracking-tight group-hover:text-primary transition-colors cursor-pointer">Intelligence Routing Status</Label>
                        <p className="text-[12px] text-muted-foreground font-medium">Include this provider in the global workload balancing pool</p>
                      </div>
                      <Switch 
                        checked={form.enabled} 
                        onCheckedChange={checked => setForm(f => ({ ...f, enabled: checked }))} 
                        className="scale-110"
                      />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Authentication Resource Pool</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black h-4 px-2 bg-emerald-500/5 text-emerald-600 border-emerald-500/20">STRICT_ROTATION</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative group">
                        <Textarea 
                          id="keys" 
                          className="min-h-[100px] font-mono text-[12px] p-4 bg-background border-border/60 outline-none focus-visible:ring-emerald-500/30 transition-all resize-none shadow-sm leading-relaxed" 
                          placeholder="ENTER_API_KEY_01&#10;ENTER_API_KEY_02&#10;..." 
                          value={form.apiKeysText}
                          onChange={e => setForm(f => ({ ...f, apiKeysText: e.target.value }))}
                        />
                        <div className="absolute top-4 right-4 text-emerald-500/5 group-focus-within:text-emerald-500/20 transition-colors pointer-events-none">
                          <Lock className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 shadow-sm animate-in fade-in slide-in-from-top-1 duration-500">
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-amber-900/90 font-bold uppercase tracking-tight">Security & Persistence Policy:</p>
                          <p className="text-[10px] text-amber-800/80 leading-relaxed font-semibold">
                            Existing keys are protected. New entries will be merged into the active pool. 
                             One key per line.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className="p-8 border-t bg-muted/40 backdrop-blur-md flex items-center justify-between sm:justify-between w-full">
                  <div className="hidden sm:block shrink-0">
                    <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">OPS_CONTROL_ACTIVE</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" className="hover:bg-background h-10 px-5 font-bold text-xs uppercase tracking-tight" onClick={() => setIsDialogOpen(false)}>Cancel Action</Button>
                    <Button 
                      onClick={saveProvider} 
                      disabled={saving || !form.code || !form.displayName || !form.modelName}
                      className="min-w-[170px] h-10 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 group transition-all"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      )}
                      {isEditing ? "Sync Pool" : "Register Pool"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <Card key={p.id} className={cn(
                "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/60",
                !p.enabled && "opacity-80 grayscale-[0.5]"
              )}>
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 blur-2xl",
                  p.enabled ? "bg-primary" : "bg-muted-foreground"
                )} />
                
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg leading-tight text-foreground">{p.displayName}</h3>
                        {!p.enabled && <Badge variant="secondary" className="h-4 text-[9px] uppercase px-1.5">Disabled</Badge>}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground font-semibold tracking-tighter">{p.code}</div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:bg-muted"
                      onClick={() => handleEditProvider(p)}
                    >
                      <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Technology</div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-foreground/80">
                        <Activity className="w-3.5 h-3.5 text-primary/70" />
                        {p.providerType}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Core Model</div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-foreground/80">
                        <Zap className="w-3.5 h-3.5 text-amber-500/70" />
                        {p.modelName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 p-4 rounded-xl bg-muted/30 border border-border/40 shadow-inner">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-primary/60" />
                        <span className="text-xs uppercase tracking-tight">Key Distribution</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border/60">{p.keyCount} Total</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-emerald-600 uppercase tracking-tighter">Active Pool</span>
                        <span className="font-mono">{p.activeKeyCount} keys</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden flex shadow-sm border border-border/20">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                          style={{ width: `${(p.activeKeyCount / Math.max(p.keyCount, 1)) * 100}%` }}
                        />
                        <div 
                          className="h-full bg-amber-500 transition-all duration-1000"
                          style={{ width: `${(p.coolingDownKeyCount / Math.max(p.keyCount, 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="text-amber-600 uppercase tracking-tighter">Cooling Down</span>
                        <span className="font-mono">{p.coolingDownKeyCount} keys</span>
                      </div>
                    </div>
                  </div>

                  {p.lastError && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive cursor-help group-hover:bg-destructive/10 transition-colors">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <div className="text-[10px] font-black truncate uppercase tracking-tighter">System Outage Detected</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-[320px] border-destructive bg-destructive text-destructive-foreground shadow-2xl p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 font-black text-xs uppercase pb-2 border-b border-destructive-foreground/20">
                              <AlertCircle className="w-4 h-4" />
                              Critical Failure Report
                            </div>
                            <p className="text-[12px] leading-relaxed font-medium">{p.lastError}</p>
                            <p className="text-[10px] font-mono mt-2 pt-2 border-t border-destructive-foreground/20 italic opacity-80 flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {p.lastErrorAt ? new Date(p.lastErrorAt).toLocaleString() : "Unknown Timestamp"}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardContent>

                <CardFooter className="pt-0 pb-5 flex flex-col gap-2">
                   <div className="w-full flex items-center justify-between text-[10px] font-bold text-muted-foreground/60 px-2 uppercase tracking-tight">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {p.lastSuccessAt ? `OK: ${new Date(p.lastSuccessAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}` : "NO_OPERATIONS"}
                      </div>
                      <div className="flex items-center gap-1.5 group-hover:text-primary transition-colors cursor-pointer">
                        <Database className="w-3.5 h-3.5" />
                        {p.maskedKeys.length} KEYS LOADED
                      </div>
                   </div>
                </CardFooter>
              </Card>
            ))}

            {providers.length === 0 && !loading && (
              <div className="col-span-full py-24 flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] bg-muted/10 opacity-60 border-border/40">
                <div className="p-5 rounded-full bg-muted/20 mb-6">
                  <Server className="w-16 h-16 text-muted-foreground/30" />
                </div>
                <h3 className="text-2xl font-black text-foreground/70 uppercase tracking-tighter">Empty Provider Registry</h3>
                <p className="text-sm text-muted-foreground mt-2 font-medium">Initialize the system by registering your first LLM infrastructure pool.</p>
                <Button variant="outline" className="mt-8 h-12 px-8 font-black rounded-full shadow-lg hover:shadow-primary/10 transition-all border-primary/20 hover:bg-primary/5 group" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" /> Register Environment Pool
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(55%_45%_at_50%_40%,rgba(var(--primary-rgb),0.02)_0%,transparent_100%)]" />
    </div>
  );
}
