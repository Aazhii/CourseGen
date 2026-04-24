import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  LayoutGrid,
  LineChart,
  ShieldCheck,
  Share2,
  Sparkles,
  Star,
  Trophy,
  Wand2,
  Zap,
} from "lucide-react";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingContentQueryOptions } from "@/lib/queries/marketing";
import { fallbackLandingContent } from "@/data/marketingContent";

import heroImage from "@/assets/hero-mockup.jpg";

export default function LandingPage() {
  const { data: content = fallbackLandingContent } = useQuery(landingContentQueryOptions());

  return (
    <div className="relative min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Header navLabels={content.header.nav} />

      <main>
        {/* ---------- HERO ---------- */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-48 md:pb-40">
          <AmbientBackground showParticles particleInfluence={120} particleDensity={0.00007} />

          <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-8">
            <div className="grid items-center gap-16 lg:grid-cols-12">
              <div className="lg:col-span-7 animate-fade-up">
                <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-xs mb-8 border border-white/10 group cursor-default">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-cta shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                    <Sparkles className="h-3 w-3 text-primary-foreground animate-pulse" />
                  </span>
                  <span className="text-white/80 font-medium uppercase tracking-[0.05em]">
                    {content.hero.badge}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/40 group-hover:translate-x-0.5 transition-transform" />
                </div>

                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.02] tracking-tight">
                  {content.hero.titlePrefix}
                  <br />
                  <span className="text-gradient">{content.hero.titleHighlight}</span>
                </h1>

                <p className="mt-8 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
                  {content.hero.description}
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Button asChild variant="hero" size="xl" className="group btn-shine">
                    <Link to="/login">
                      {content.hero.primaryCta} <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="xl" className="border-white/10 hover:border-white/20">
                    <a href="#how">{content.hero.secondaryCta}</a>
                  </Button>
                </div>

                <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                  {content.hero.trust.map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" /> {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 relative">
                <div className="relative animate-float-slow">
                  <div className="absolute -inset-10 rounded-[3rem] bg-primary/20 blur-[100px] opacity-40 mix-blend-screen" />
                  <div className="absolute -inset-10 rounded-[3rem] bg-accent/20 blur-[100px] opacity-30 mix-blend-screen translate-x-20" />

                  <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-background/50 backdrop-blur-3xl shadow-2xl aspect-[4/5] lg:aspect-[4/3] flex items-center justify-center group">
                    <img
                      src={heroImage}
                      alt="AI CourseGen Dashboard"
                      className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.68_0.22_295_/_30%),transparent_60%)]" />
                  </div>

                  <FloatingCard
                    className="absolute -left-8 top-10 hidden md:block"
                    icon={<Bot className="h-4 w-4 text-accent" />}
                    title="AI generated 8 modules"
                    subtitle="From a single prompt"
                  />
                  <FloatingCard
                    className="absolute -right-6 bottom-12 hidden md:block"
                    icon={<Trophy className="h-4 w-4 text-secondary-foreground" />}
                    title="92% completion"
                    subtitle="vs. 41% baseline"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- SOCIAL PROOF ---------- */}
        <section className="relative border-y border-white/5 bg-background/40 py-12 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="grid items-center gap-12 md:grid-cols-[auto_1fr]">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
                Trusted by teams shipping<br className="hidden md:block" /> learning programs.
              </p>
              <div className="relative group overflow-hidden">
                <div className="flex w-max animate-marquee gap-16 pr-16 group-hover:[animation-play-state:paused]">
                  {[...content.logos, ...content.logos].map((l, i) => (
                    <span
                      key={i}
                      className="font-display text-2xl font-bold tracking-tighter text-white/20 hover:text-white/60 transition-all duration-300"
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FEATURES ---------- */}
        <section id="features" className="relative py-32 md:py-48">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <Eyebrow>Platform</Eyebrow>
            <SectionTitle>
              Everything you need to <span className="text-gradient">create, learn, and ship</span> knowledge.
            </SectionTitle>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              A single workspace for prompt-driven course creation, structured learning, and team-grade
              collaboration.
            </p>

            <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {FEATURE_ICONS.map((Icon, index) => {
                const feature = content.features[index];
                if (!feature) return null;
                return <FeatureCard key={feature.title} icon={Icon} title={feature.title} desc={feature.desc} />;
              })}
            </div>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how" className="relative py-24 md:py-32">
          <div className="absolute inset-x-0 top-0 mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <Eyebrow>How it works</Eyebrow>
            <SectionTitle>
              From a blank page to a <span className="text-gradient">launch-ready course</span>.
            </SectionTitle>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {content.steps.map((s, i) => (
                <div key={s.n} className="relative glass-strong rounded-[2rem] p-10 border border-white/5 transition-all hover:border-white/15 hover:-translate-y-1">
                  <div className="flex items-center gap-4">
                    <span className="font-display text-xs font-bold text-muted-foreground tracking-[0.2em]">STEP</span>
                    <span className="font-display text-4xl font-bold text-gradient">{s.n}</span>
                  </div>
                  <h3 className="mt-8 font-display text-2xl font-bold tracking-tight text-white">{s.title}</h3>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed font-medium">{s.desc}</p>
                  {i < content.steps.length - 1 && (
                    <ArrowRight className="absolute -right-4 top-1/2 hidden h-8 w-8 -translate-y-1/2 text-white/30 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- SHOWCASE ---------- */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="mx-auto max-w-7xl px-6 md:px-8 relative z-10">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <Eyebrow>Inside the workspace</Eyebrow>
                <SectionTitle>
                  A tool that <span className="text-gradient">feels alive</span>.
                </SectionTitle>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed font-medium">
                  Generate a course, bridge the modules, and chat with the AI coach — all in one fluid
                  workspace designed for deep focus and maximum output.
                </p>
                <ul className="mt-10 space-y-4">
                  {content.showcaseBullets.map((t) => (
                    <li key={t} className="flex items-start gap-4 text-foreground font-medium">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-6 rounded-[3rem] bg-gradient-cta opacity-20 blur-3xl" />
                <div className="relative grid grid-cols-6 gap-4">
                  <MockCard className="col-span-4 translate-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Course Overview</div>
                        <div className="font-display text-xl font-bold text-white mt-1">Vector DB Mastery</div>
                      </div>
                      <span className="rounded-full bg-primary/20 border border-primary/40 px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                        AI Generated
                      </span>
                    </div>
                    <div className="space-y-3">
                      {["Embedding Foundations", "Indexing strategies", "Hybrid search patterns"].map((m, i) => (
                        <div key={m} className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/5 p-4 text-sm font-medium">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-cta text-[11px] font-bold text-white">
                            {i + 1}
                          </span>
                          <span className="flex-1">{m}</span>
                          <span className="text-xs text-muted-foreground">{6 + i} lessons</span>
                        </div>
                      ))}
                    </div>
                  </MockCard>
                  <MockCard className="col-span-2 -translate-y-4">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-4">AI Coach</div>
                    <div className="space-y-3 text-xs font-medium">
                      <div className="rounded-2xl bg-white/5 p-4 border border-white/10 italic text-muted-foreground">Explain HNSW simply.</div>
                      <div className="rounded-2xl bg-primary/20 p-4 text-white border border-primary/30">
                        Think layered shortcuts on a graph — fast at top, precise at bottom.
                      </div>
                    </div>
                  </MockCard>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- USE CASES ---------- */}
        <section id="use-cases" className="relative py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <Eyebrow>Use cases</Eyebrow>
            <SectionTitle>
              Built for the way <span className="text-gradient">modern teams learn</span>.
            </SectionTitle>

            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {USE_CASE_ICONS.map((Icon, index) => {
                const useCase = content.useCases[index];
                if (!useCase) return null;
                return <div key={useCase.title} className="glass rounded-2xl p-8 transition-all hover:-translate-y-0.5 hover:border-white/10 border border-white/5 bg-white/[0.02]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-cta shadow-glow">
                    <Icon className="h-6 w-6 text-white" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-bold tracking-tight text-white">{useCase.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">{useCase.desc}</p>
                </div>;
              })}
            </div>
          </div>
        </section>


        {/* ---------- TESTIMONIALS ---------- */}
        <section className="relative py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <Eyebrow>Outcomes</Eyebrow>
            <SectionTitle>
              Loved by teams who care about <span className="text-gradient">real results</span>.
            </SectionTitle>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {content.quotes.map((q) => (
                <figure key={q.name} className="glass-strong rounded-[2.5rem] p-10 border border-white/5 relative group hover:border-white/15 transition-all">
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent animate-pulse" />
                    ))}
                  </div>
                  <blockquote className="text-lg leading-relaxed text-white font-medium italic">
                    “{q.quote}”
                  </blockquote>
                  <figcaption className="mt-10 flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-cta text-sm font-bold text-white">
                      {q.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">{q.name}</div>
                      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">{q.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FINAL CTA ---------- */}
        <section id="pricing" className="relative py-24 md:py-48">
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="relative overflow-hidden rounded-[4rem] border border-white/10 p-12 md:p-24 bg-background/50 backdrop-blur-3xl shadow-glow">
              <div className="absolute inset-0 bg-aurora opacity-20" />
              <div className="absolute -top-48 -right-48 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
              <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-accent/20 blur-[120px] rounded-full" />

              <div className="relative text-center max-w-4xl mx-auto">
                <Eyebrow center>Get started</Eyebrow>
                <h2 className="mt-8 font-display text-5xl md:text-7xl font-bold leading-[1] tracking-tight text-white">
                  {content.finalCta.titlePrefix} <span className="text-gradient">{content.finalCta.titleHighlight}</span>
                </h2>
                <p className="mt-8 text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
                  {content.finalCta.description}
                </p>
                <div className="mt-12 flex flex-wrap justify-center gap-6">
                  <Button asChild variant="hero" size="xl" className="h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs btn-shine">
                    <Link to="/login">
                      {content.finalCta.primary} <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="glass" size="xl" className="h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-xs bg-white/[0.03] border-white/10 hover:bg-white/10">
                    <a href="#features">{content.finalCta.secondary}</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer content={content.footer} />
    </div>
  );
}

function FloatingCard({
  className = "",
  icon,
  title,
  subtitle,
}: {
  className?: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className={"glass-strong rounded-2xl px-5 py-4 shadow-glow border border-white/10 backdrop-blur-3xl animate-fade-in " + className}>
      <div className="flex items-center gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] border border-white/10">{icon}</span>
        <div>
          <div className="text-sm font-bold text-white tracking-tight">{title}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function MockCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={"glass-strong rounded-[2rem] p-8 border border-white/5 shadow-2xl backdrop-blur-3xl " + className}>{children}</div>;
}

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={cn("flex mb-4", center ? "justify-center" : "justify-start")}>
      <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
        <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(34,211,238,0.8)] animate-pulse" />
        {children}
      </span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white">
      {children}
    </h2>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] glass-strong p-10 transition-all duration-500 hover:-translate-y-1 hover:border-white/20 border border-white/5">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="relative">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[oklch(0.84_0.16_200/15%)] border border-[oklch(0.84_0.16_200/40%)] group-hover:bg-[oklch(0.84_0.16_200/25%)] group-hover:border-[oklch(0.84_0.16_200/70%)] group-hover:scale-110 transition-all duration-500">
          <Icon className="h-7 w-7 text-[oklch(0.84_0.16_200)] transition-colors" />
        </span>
        <h3 className="mt-10 font-display text-2xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">{title}</h3>
        <p className="mt-4 text-[15px] text-muted-foreground leading-relaxed font-medium">{desc}</p>
      </div>
    </div>
  );
}

const FEATURE_ICONS = [Wand2, FolderKanban, LayoutGrid, Bot, Share2, LineChart, ShieldCheck, Zap] as const;

const USE_CASE_ICONS = [GraduationCap, Bot, Sparkles, Share2] as const;
