import { AppShell } from "@/components/layout/AppShell";
import { ConceptA } from "@/components/dashboard/timeline/ConceptA";
import { ConceptB } from "@/components/dashboard/timeline/ConceptB";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";
import { ConceptD } from "@/components/dashboard/timeline/ConceptD";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConceptMeta {
  id: string;
  title: string;
  description: string;
  status: "exploring" | "selected" | "archived";
  Component: React.ComponentType;
}

interface ConceptSection {
  title: string;
  description: string;
  concepts: ConceptMeta[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTIONS: ConceptSection[] = [
  {
    title: "Timeline",
    description: "Approaches for communicating assessment windows — where in the school year the teacher is relative to Pre, Mid, and Post assessments.",
    concepts: [
      {
        id: "A",
        title: "Tab Strip",
        description: "Assessment windows as selectable pill tabs, inspired by a day picker. The active window is highlighted; tapping a tab shows its status. Familiar and compact — could double as navigation between historical windows.",
        status: "exploring",
        Component: ConceptA,
      },
      {
        id: "B",
        title: "Connected Cards",
        description: "Each assessment window gets its own card connected by a progress line, inspired by a product roadmap. Gives each window equal visual weight and makes status scannable at a glance. Good for team reviews.",
        status: "exploring",
        Component: ConceptB,
      },
      {
        id: "C",
        title: "School Year Strip",
        description: "The full Aug–Jun school year as a horizontal strip with assessment windows shown as colored bands and a 'today' marker. Gives temporal context across the whole year, not just the three windows.",
        status: "selected",
        Component: ConceptC,
      },
      {
        id: "D",
        title: "Stepper + Countdown",
        description: "A linear step indicator with a pulsing dot on the active window and a contextual callout showing days until the next assessment. Gives educators a direct action cue — useful when a window is approaching.",
        status: "exploring",
        Component: ConceptD,
      },
    ],
  },
];

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS = {
  selected:  { label: "Selected",  bg: "#dcf0e5", text: "#166534" },
  exploring: { label: "Exploring", bg: "#fef9c3", text: "#854d0e" },
  archived:  { label: "Archived",  bg: "#f3f4f6", text: "#6b7280" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConceptsPage() {
  return (
    <AppShell>
      <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight mb-1">
            Concepts
          </h1>
          <p className="text-[14px] text-gray-500">
            A living repository of design explorations for the DESSA refresh. Each section covers a distinct UI problem with multiple approaches for team review.
          </p>
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <section key={section.title} className="mb-14">
            {/* Section header */}
            <div className="mb-5 pb-3 border-b border-[#e2e8f0]">
              <h2 className="text-[18px] font-bold text-gray-900 mb-1">{section.title}</h2>
              <p className="text-[13px] text-gray-500">{section.description}</p>
            </div>

            {/* Concept grid */}
            <div className="grid grid-cols-2 gap-6">
              {section.concepts.map(({ id, title, description, status, Component }) => {
                const badge = STATUS[status];
                return (
                  <div
                    key={id}
                    className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="w-6 h-6 rounded-full bg-[#1a4e8a] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                          {id}
                        </span>
                        <span className="text-[15px] font-bold text-gray-900 flex-1">{title}</span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.text }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 leading-relaxed">{description}</p>
                    </div>

                    {/* Component preview */}
                    <div className="px-6 py-5">
                      <Component />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
