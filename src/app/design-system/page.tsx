import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

const COLORS = [
  { name: "Navy / Primary", hex: "#1a4e8a", token: "--dessa-navy", usage: "Logo, primary actions, active tab indicators" },
  { name: "Teal / CTA", hex: "#0d7e7e", token: "--dessa-teal", usage: "Buttons, current state markers" },
  { name: "Link Blue", hex: "#1565c0", token: "--dessa-link", usage: "Anchor links, View Details" },
  { name: "Page Background", hex: "#edf1f6", token: "--dessa-page-bg", usage: "App background" },
  { name: "Card Background", hex: "#ffffff", token: "--color-card", usage: "Panels, cards" },
  { name: "Border", hex: "#e2e8f0", token: "--color-border", usage: "Card borders, dividers" },
  { name: "Text Primary", hex: "#111827", token: "--color-foreground", usage: "Headings, values" },
  { name: "Text Muted", hex: "#6b7280", token: "--color-muted-foreground", usage: "Labels, secondary text, axis ticks" },
];

const ASSESSMENT_COLORS = [
  { name: "Need for Instruction", hex: "#f38b8b", light: "#fce8e8", token: "--dessa-need", usage: "Students performing below typical range" },
  { name: "Typical", hex: "#7ab5de", light: "#ddeef8", token: "--dessa-typical", usage: "Students performing within typical range" },
  { name: "Strength", hex: "#7dc49a", light: "#dcf0e5", token: "--dessa-strength", usage: "Students performing above typical range" },
];

const TIMELINE_COLORS = [
  { name: "Completed", hex: "#22c55e", usage: "Past assessment windows, completed dots" },
  { name: "Current", hex: "#0891b2", usage: "Active assessment window dot" },
  { name: "Upcoming", hex: "#cbd5e1", usage: "Future assessment window" },
];

const TYPE_SCALE = [
  { name: "Page Title", sample: "Welcome back, Tara!", className: "text-[28px] font-extrabold", spec: "28px / 800" },
  { name: "Card Title", sample: "Grade Level Comparison", className: "text-[15px] font-bold", spec: "15px / 700" },
  { name: "Card Subtitle / Period", sample: "25-26 Mid", className: "text-[15px] text-gray-500", spec: "15px / 400, muted" },
  { name: "Body / Subtitle", sample: "Let's assess your students and identify targeted strategies", className: "text-[14px] text-gray-500", spec: "14px / 400, muted" },
  { name: "Link", sample: "View Details", className: "text-[13px] font-medium text-[#1565c0] hover:underline", spec: "13px / 500, link blue" },
  { name: "Metric Value", sample: "1", className: "text-[48px] font-bold", spec: "48px / 700" },
  { name: "Chart Axis / Label", sample: "Student Grade Level", className: "text-[12px] text-gray-500", spec: "12px / 400, muted" },
  { name: "Chart Value", sample: "68%", className: "text-[10px] font-bold text-white", spec: "10px / 700, white (inside bars)" },
];

const SPACING = [
  { token: "Card padding", value: "24px (p-6)" },
  { token: "Card gap (grid)", value: "20px (gap-5)" },
  { token: "Section gap", value: "20px (mb-5)" },
  { token: "Welcome margin-bottom", value: "28px (mb-7)" },
  { token: "Card border-radius", value: "8px (rounded-lg)" },
  { token: "Input / button border-radius", value: "6px (rounded-md)" },
  { token: "Search bar border-radius", value: "9999px (rounded-full)" },
  { token: "Max content width", value: "1080px" },
];

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

export default function DesignSystemPage() {
  return (
    <AppShell>
      <div className="max-w-[1080px] w-full mx-auto px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 mb-1">Design System</h1>
            <p className="text-[14px] text-gray-500">
              Tokens, patterns, and decisions for the DESSA refresh
            </p>
          </div>
          <div className="ml-auto">
            <Link
              href="/"
              className="text-sm font-medium text-[#1565c0] hover:underline"
            >
              ← Dashboard
            </Link>
          </div>
        </div>

        {/* Color — Base */}
        <Section title="Base Colors">
          <div className="grid grid-cols-4 gap-4">
            {COLORS.map((c) => (
              <ColorSwatch key={c.name} {...c} />
            ))}
          </div>
        </Section>

        {/* Color — Assessment */}
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

        {/* Color — Timeline */}
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

        {/* Typography */}
        <Section title="Type Scale">
          <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
            {TYPE_SCALE.map((t) => (
              <div key={t.name} className="px-5 py-4 flex items-center gap-6">
                <div className="w-44 shrink-0">
                  <p className="text-[12px] font-semibold text-gray-700">{t.name}</p>
                  <p className="text-[11px] font-mono text-gray-400">{t.spec}</p>
                </div>
                <div className={t.className + " truncate flex-1"}>{t.sample}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing & Shape */}
        <Section title="Spacing & Shape">
          <div className="bg-white border border-[#e2e8f0] rounded-lg divide-y divide-[#e2e8f0]">
            {SPACING.map((s) => (
              <div key={s.token} className="px-5 py-3 flex items-center gap-6">
                <p className="text-[13px] font-semibold text-gray-700 w-56 shrink-0">{s.token}</p>
                <p className="text-[13px] font-mono text-gray-500">{s.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Design Decisions */}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[15px] font-bold text-gray-900 mb-3 uppercase tracking-wide text-xs text-gray-500">
        {title}
      </h2>
      {children}
    </section>
  );
}

interface ColorSwatchProps {
  name: string;
  hex: string;
  token: string;
  usage: string;
}

function ColorSwatch({ name, hex, token, usage }: ColorSwatchProps) {
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
