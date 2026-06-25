"use client";

import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Color data ───────────────────────────────────────────────────────────────

const COLORS = [
  { name: "Navy / Primary",   hex: "#1a4e8a", token: "--dessa-navy",         usage: "Logo, primary actions, active tab indicators" },
  { name: "Teal / CTA",       hex: "#0d7e7e", token: "--dessa-teal",         usage: "Buttons, current state markers" },
  { name: "Link Blue",        hex: "#1565c0", token: "--dessa-link",         usage: "Anchor links, View Details" },
  { name: "Page Background",  hex: "#edf1f6", token: "--dessa-page-bg",      usage: "App background" },
  { name: "Card Background",  hex: "#ffffff", token: "--color-card",         usage: "Panels, cards" },
  { name: "Border",           hex: "#e2e8f0", token: "--color-border",       usage: "Card borders, dividers" },
  { name: "Text Primary",     hex: "#111827", token: "--color-foreground",   usage: "Headings, values" },
  { name: "Text Muted",       hex: "#6b7280", token: "--color-muted-foreground", usage: "Labels, secondary text, axis ticks" },
];

const ASSESSMENT_COLORS = [
  { name: "Need for Instruction", hex: "#f38b8b", light: "#fce8e8", token: "--dessa-need",     usage: "Students performing below typical range" },
  { name: "Typical",              hex: "#7ab5de", light: "#ddeef8", token: "--dessa-typical",  usage: "Students performing within typical range" },
  { name: "Strength",             hex: "#7dc49a", light: "#dcf0e5", token: "--dessa-strength", usage: "Students performing above typical range" },
];

const TIMELINE_COLORS = [
  { name: "Completed", hex: "#22c55e", usage: "Past assessment windows, completed dots" },
  { name: "Current",   hex: "#0891b2", usage: "Active assessment window dot" },
  { name: "Upcoming",  hex: "#cbd5e1", usage: "Future assessment window" },
];

// ─── Typography scale ─────────────────────────────────────────────────────────

const TYPE_SCALE = [
  {
    tag: "H1",
    name: "Page Title",
    sample: "Welcome back, Tara!",
    className: "text-[28px] font-extrabold text-gray-900 leading-tight",
    spec: "28px · 800 · leading-tight",
    mb: "mb-6 (24px)",
    tokens: ["text-[28px]", "font-extrabold", "leading-tight"],
  },
  {
    tag: "H2",
    name: "Section Heading",
    sample: "Grade Level Summary",
    className: "text-[20px] font-bold text-gray-900 leading-snug",
    spec: "20px · 700 · leading-snug",
    mb: "mb-4 (16px)",
    tokens: ["text-[20px]", "font-bold", "leading-snug"],
  },
  {
    tag: "H3",
    name: "Card / Widget Title",
    sample: "Grade Level Comparison",
    className: "text-[15px] font-bold text-gray-900 leading-snug",
    spec: "15px · 700 · leading-snug",
    mb: "mb-2 (8px)",
    tokens: ["text-[15px]", "font-bold"],
  },
  {
    tag: "H4",
    name: "Subheading / Period Label",
    sample: "25-26 Mid",
    className: "text-[15px] font-normal text-gray-500 leading-normal",
    spec: "15px · 400 · muted",
    mb: "mb-2 (8px)",
    tokens: ["text-[15px]", "text-muted-foreground"],
  },
  {
    tag: "p",
    name: "Body / Description",
    sample: "Let's assess your students and identify targeted strategies for growth.",
    className: "text-[14px] text-gray-500 leading-relaxed",
    spec: "14px · 400 · leading-relaxed",
    mb: "mb-4 (16px)",
    tokens: ["text-sm", "text-muted-foreground", "leading-relaxed"],
  },
  {
    tag: "small",
    name: "Label / Link",
    sample: "View Details →",
    className: "text-[13px] font-medium text-[#1565c0]",
    spec: "13px · 500 · link blue",
    mb: "mb-1 (4px)",
    tokens: ["text-[13px]", "font-medium", "text-dessa-link"],
  },
  {
    tag: "micro",
    name: "Caption / Chart Axis",
    sample: "Student Grade Level",
    className: "text-[12px] text-gray-500",
    spec: "12px · 400 · muted",
    mb: "—",
    tokens: ["text-xs", "text-muted-foreground"],
  },
];

// ─── Button data ──────────────────────────────────────────────────────────────

const BUTTON_VARIANTS = [
  { variant: "default"     as const, label: "Primary",     tokens: ["bg-primary", "text-primary-foreground"],         usage: "Primary actions: Save, Submit, Confirm" },
  { variant: "outline"     as const, label: "Outline",     tokens: ["border-border", "bg-background"],                usage: "Secondary actions alongside a primary" },
  { variant: "secondary"   as const, label: "Secondary",   tokens: ["bg-secondary", "text-secondary-foreground"],     usage: "Low-emphasis actions, filter toggles" },
  { variant: "ghost"       as const, label: "Ghost",       tokens: ["transparent", "hover:bg-muted"],                 usage: "Inline actions, icon buttons, nav items" },
  { variant: "destructive" as const, label: "Destructive", tokens: ["bg-destructive/10", "text-destructive"],         usage: "Delete, remove, irreversible actions" },
  { variant: "link"        as const, label: "Link",        tokens: ["text-primary", "underline-offset-4"],            usage: "Inline text links, View Details" },
];

const BUTTON_SIZES = [
  { size: "xs"      as const, label: "xs",      height: "h-6 (24px)",  hPad: "px-2 (8px)",   font: "text-xs (12px)" },
  { size: "sm"      as const, label: "sm",      height: "h-7 (28px)",  hPad: "px-2.5 (10px)", font: "text-[0.8rem]" },
  { size: "default" as const, label: "default", height: "h-8 (32px)",  hPad: "px-2.5 (10px)", font: "text-sm (14px)" },
  { size: "lg"      as const, label: "lg",      height: "h-9 (36px)",  hPad: "px-2.5 (10px)", font: "text-sm (14px)" },
];

// ─── Input anatomy rows ───────────────────────────────────────────────────────

const INPUT_ANATOMY = [
  { property: "Height",               value: "32px",               token: "h-8" },
  { property: "Horizontal padding",   value: "10px",               token: "px-2.5" },
  { property: "Vertical padding",     value: "4px",                token: "py-1" },
  { property: "Border radius",        value: "8px",                token: "rounded-lg" },
  { property: "Border (rest)",        value: "#e2e8f0",            token: "border-input" },
  { property: "Border (focus)",       value: "#1a4e8a",            token: "border-ring" },
  { property: "Focus ring width",     value: "3px",                token: "ring-3" },
  { property: "Focus ring color",     value: "navy 50% opacity",   token: "ring-ring/50" },
  { property: "Font size",            value: "14px (md+)",         token: "md:text-sm" },
  { property: "Placeholder color",    value: "#6b7280",            token: "text-muted-foreground" },
];

// ─── Spacing scale ────────────────────────────────────────────────────────────

const SPACING_SCALE = [
  { twClass: "spacing-1",  px: "4px",  barW: 4  },
  { twClass: "spacing-2",  px: "8px",  barW: 8  },
  { twClass: "spacing-3",  px: "12px", barW: 12 },
  { twClass: "spacing-4",  px: "16px", barW: 16 },
  { twClass: "spacing-5",  px: "20px", barW: 20 },
  { twClass: "spacing-6",  px: "24px", barW: 24 },
  { twClass: "spacing-8",  px: "32px", barW: 32 },
  { twClass: "spacing-10", px: "40px", barW: 40 },
  { twClass: "spacing-12", px: "48px", barW: 48 },
  { twClass: "spacing-16", px: "64px", barW: 64 },
];

const APP_SPACING = [
  { token: "Card padding",          value: "24px", twClass: "p-6" },
  { token: "Card gap (grid)",       value: "20px", twClass: "gap-5" },
  { token: "Section gap",           value: "20px", twClass: "mb-5" },
  { token: "Page header margin",    value: "28px", twClass: "mb-7" },
  { token: "Card border-radius",    value: "8px",  twClass: "rounded-lg" },
  { token: "Button border-radius",  value: "6px",  twClass: "rounded-md" },
  { token: "Input border-radius",   value: "8px",  twClass: "rounded-lg" },
  { token: "Search border-radius",  value: "9999px", twClass: "rounded-full" },
  { token: "Max content width",     value: "1080px", twClass: "max-w-[1080px]" },
];

// ─── Design decisions ─────────────────────────────────────────────────────────

const DECISIONS = [
  {
    title: "Inter over Geist Sans",
    body: "Switched from the Next.js default Geist to Inter. Inter's slightly more humanist letterforms are better suited to an education platform where readability at small sizes matters. Geist skews techy/developer.",
  },
  {
    title: "Assessment colors are semantic, not decorative",
    body: "Need (coral red), Typical (steel blue), Strength (soft green) are used consistently across every chart and badge in the app. They are never repurposed for other meanings. This lets educators scan dashboards without reading labels.",
  },
  {
    title: "Cards on a tinted page background",
    body: "The #edf1f6 page background creates clear visual hierarchy — white cards 'float' on it without needing heavy shadows. Consistent with the original DESSA product.",
  },
  {
    title: "Recharts for data visualisation",
    body: "Recharts is SVG-based, ships with accessibility attributes, and integrates well with React. The charts are wrapped in ResponsiveContainer so they adapt to the grid layout without manual breakpoint math.",
  },
  {
    title: "Framer Motion reserved for interactions",
    body: "Chart bars use isAnimationActive=false (recharts internal animation is not coordinated with the page). Framer Motion will be added explicitly for page transitions, card entrance animations, and micro-interactions.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  return (
    <AppShell>
      <div className="max-w-[1080px] w-full mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 mb-1">Design System</h1>
          <p className="text-[14px] text-gray-500">
            Tokens, patterns, and component specs for the DESSA refresh
          </p>
        </div>

        {/* ── Color: Base ──────────────────────────────────── */}
        <Section title="Base Colors">
          <div className="grid grid-cols-4 gap-4">
            {COLORS.map((c) => <ColorSwatch key={c.name} {...c} />)}
          </div>
        </Section>

        {/* ── Color: Assessment ────────────────────────────── */}
        <Section title="Assessment Classification Colors">
          <div className="grid grid-cols-3 gap-4">
            {ASSESSMENT_COLORS.map((c) => (
              <div key={c.name} className="bg-white border border-[#e2e8f0] rounded-lg p-4">
                <div className="flex gap-2 mb-3">
                  <div className="w-10 h-10 rounded" style={{ backgroundColor: c.hex }} />
                  <div className="w-10 h-10 rounded" style={{ backgroundColor: c.light }} />
                </div>
                <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{c.name}</p>
                <p className="text-[11px] font-mono text-gray-500 mb-1">{c.hex} / {c.light}</p>
                <p className="text-[12px] text-gray-500">{c.usage}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Color: Timeline ──────────────────────────────── */}
        <Section title="Timeline State Colors">
          <div className="grid grid-cols-3 gap-4">
            {TIMELINE_COLORS.map((c) => (
              <div key={c.name} className="bg-white border border-[#e2e8f0] rounded-lg p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full mt-0.5 shrink-0" style={{ backgroundColor: c.hex }} />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-0.5">{c.name}</p>
                  <p className="text-[11px] font-mono text-gray-500 mb-1">{c.hex}</p>
                  <p className="text-[12px] text-gray-500">{c.usage}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ───────────────────────────────────── */}
        <Section title="Typography — H1 to Micro">
          <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
            {TYPE_SCALE.map((t) => (
              <div key={t.tag} className="px-5 py-5 grid grid-cols-[80px_1fr_220px] gap-6 items-start">
                <div className="pt-0.5">
                  <p className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wide mb-0.5">{t.tag}</p>
                  <p className="text-[10px] text-gray-400 leading-tight">{t.spec}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2">{t.name}</p>
                  <div className={t.className}>{t.sample}</div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Tokens</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {t.tokens.map((tok) => <TokenChip key={tok}>{tok}</TokenChip>)}
                  </div>
                  <p className="text-[10px] text-gray-400">default margin-bottom: <span className="font-mono">{t.mb}</span></p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Buttons ──────────────────────────────────────── */}
        <Section title="Buttons">

          <SubSection title="Variants">
            <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
              {BUTTON_VARIANTS.map((v) => (
                <div key={v.variant} className="px-5 py-4 grid grid-cols-[96px_140px_1fr_auto] gap-5 items-center">
                  <p className="text-[12px] font-semibold text-gray-700">{v.label}</p>
                  <div><Button variant={v.variant}>Button</Button></div>
                  <p className="text-[12px] text-gray-500">{v.usage}</p>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {v.tokens.map((t) => <TokenChip key={t}>{t}</TokenChip>)}
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Sizes (Primary variant)">
            <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
              {BUTTON_SIZES.map((s) => (
                <div key={s.size} className="px-5 py-4 grid grid-cols-[96px_140px_1fr] gap-5 items-center">
                  <p className="text-[12px] font-semibold text-gray-700">{s.label}</p>
                  <div><Button size={s.size}>Button</Button></div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                    <span className="text-[11px] text-gray-500">height: <TokenChip>{s.height}</TokenChip></span>
                    <span className="text-[11px] text-gray-500">h-padding: <TokenChip>{s.hPad}</TokenChip></span>
                    <span className="text-[11px] text-gray-500">font: <TokenChip>{s.font}</TokenChip></span>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="States (Primary variant)">
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-6">
              <div className="grid grid-cols-4 gap-6">
                <StateDemo label="Default" chips={["variant=default"]}>
                  <Button>Save Changes</Button>
                </StateDemo>
                <StateDemo label="Focus" chips={["border-ring", "ring-3", "ring-ring/50"]}>
                  <Button className="border-ring ring-3 ring-ring/50">Save Changes</Button>
                </StateDemo>
                <StateDemo label="Loading" chips={["disabled", "opacity-50"]}>
                  <Button disabled>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving…
                  </Button>
                </StateDemo>
                <StateDemo label="Destructive" chips={["bg-destructive/10", "text-destructive"]}>
                  <Button variant="destructive">Delete Record</Button>
                </StateDemo>
              </div>
              <p className="text-[11px] text-gray-400 mt-5 pt-5 border-t border-[#e2e8f0]">
                Hover state: <TokenChip>[a]:hover:bg-primary/80</TokenChip> — visible on mouse interaction only; applies via CSS <TokenChip>:hover</TokenChip> pseudo-class.
              </p>
            </div>
          </SubSection>
        </Section>

        {/* ── Input Fields ─────────────────────────────────── */}
        <Section title="Input Fields">

          <SubSection title="States">
            <div className="bg-white border border-[#e2e8f0] rounded-lg p-6">
              <div className="grid grid-cols-3 gap-8">
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-2">Default</p>
                    <Input placeholder="Enter value…" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <TokenChip>border-input</TokenChip>
                    <TokenChip>bg-transparent</TokenChip>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-2">Focused</p>
                    <Input
                      placeholder="Enter value…"
                      className="border-ring ring-3 ring-ring/50"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <TokenChip>border-ring</TokenChip>
                    <TokenChip>ring-3</TokenChip>
                    <TokenChip>ring-ring/50</TokenChip>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-2">Error</p>
                    <Input
                      placeholder="Enter value…"
                      aria-invalid="true"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <TokenChip>aria-invalid</TokenChip>
                    <TokenChip>border-destructive</TokenChip>
                    <TokenChip>ring-destructive/20</TokenChip>
                  </div>
                </div>
              </div>
            </div>
          </SubSection>

          <SubSection title="Anatomy">
            <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
              {INPUT_ANATOMY.map((row) => (
                <div key={row.property} className="px-5 py-3 grid grid-cols-[200px_160px_1fr] gap-4 items-center">
                  <p className="text-[12px] font-semibold text-gray-700">{row.property}</p>
                  <p className="text-[12px] text-gray-500">{row.value}</p>
                  <TokenChip>{row.token}</TokenChip>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ── Spacing Scale ────────────────────────────────── */}
        <Section title="Spacing Scale — multiples of 4">
          <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
            {SPACING_SCALE.map((s) => (
              <div key={s.twClass} className="px-5 py-3 grid grid-cols-[120px_72px_1fr] gap-4 items-center">
                <TokenChip>{s.twClass}</TokenChip>
                <p className="text-[12px] font-mono font-semibold text-gray-700">{s.px}</p>
                <div
                  className="bg-[#1a4e8a]/20 rounded-sm h-3 shrink-0"
                  style={{ width: s.barW }}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* ── App Spacing Tokens ───────────────────────────── */}
        <Section title="App Spacing Tokens">
          <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
            {APP_SPACING.map((s) => (
              <div key={s.token} className="px-5 py-3 grid grid-cols-[220px_100px_1fr] gap-4 items-center">
                <p className="text-[13px] font-semibold text-gray-700">{s.token}</p>
                <p className="text-[12px] font-mono text-gray-500">{s.value}</p>
                <TokenChip>{s.twClass}</TokenChip>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Design Decisions ─────────────────────────────── */}
        <Section title="Design Decisions">
          <div className="grid grid-cols-1 gap-4">
            {DECISIONS.map((d) => (
              <div key={d.title} className="bg-white border border-[#e2e8f0] rounded-lg p-5">
                <p className="text-[14px] font-bold text-gray-900 mb-1">{d.title}</p>
                <p className="text-[13px] text-gray-600 leading-relaxed">{d.body}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>
    </AppShell>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-[12px] font-semibold text-gray-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function TokenChip({ children }: { children: React.ReactNode }) {
  return (
    <code className="inline-block bg-gray-100 text-gray-600 text-[10px] font-mono px-1.5 py-0.5 rounded whitespace-nowrap">
      {children}
    </code>
  );
}

function StateDemo({ label, chips, children }: { label: string; chips: string[]; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <p className="text-[11px] font-semibold text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-1 justify-center">
        {chips.map((c) => <TokenChip key={c}>{c}</TokenChip>)}
      </div>
    </div>
  );
}

function ColorSwatch({ name, hex, token, usage }: { name: string; hex: string; token: string; usage: string }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
      <div className="h-14" style={{ backgroundColor: hex }} />
      <div className="p-3">
        <p className="text-[12px] font-semibold text-gray-900 mb-0.5">{name}</p>
        <p className="text-[11px] font-mono text-gray-500 mb-1">{hex}</p>
        <p className="text-[10px] font-mono text-gray-400 mb-1">{token}</p>
        <p className="text-[11px] text-gray-500">{usage}</p>
      </div>
    </div>
  );
}
