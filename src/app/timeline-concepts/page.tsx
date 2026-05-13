import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ConceptA } from "@/components/dashboard/timeline/ConceptA";
import { ConceptB } from "@/components/dashboard/timeline/ConceptB";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";
import { ConceptD } from "@/components/dashboard/timeline/ConceptD";

const CONCEPTS = [
  {
    id: "A",
    title: "Tab Strip",
    description:
      "Assessment windows as selectable pill tabs — inspired by a day picker. The active window is highlighted; tapping a tab shows its status. Familiar, compact, and could double as navigation between historical windows.",
  },
  {
    id: "B",
    title: "Connected Cards",
    description:
      "Each assessment window gets its own card connected by a progress line — inspired by a product roadmap. Gives each window equal visual weight and makes status scannable at a glance. Good for team reviews.",
  },
  {
    id: "C",
    title: "School Year Strip",
    description:
      "The full Aug–Jun school year rendered as a horizontal strip with assessment windows shown as colored bands and a 'today' marker. Gives temporal context across the whole year, not just the three windows.",
  },
  {
    id: "D",
    title: "Stepper + Countdown",
    description:
      "A linear step indicator with a pulsing dot on the active window and a contextual callout showing days until the next assessment. Gives educators a direct action cue — useful when a window is approaching.",
  },
];

export default function TimelineConceptsPage() {
  return (
    <AppShell>
      <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight mb-1">
              Timeline — Concepts
            </h1>
            <p className="text-[14px] text-gray-500">
              Four approaches for communicating assessment windows. All use the same data: Pre (Aug 01), Mid (Jan 01, current), Post (May 28).
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-[#1565c0] hover:underline shrink-0 mt-1">
            ← Dashboard
          </Link>
        </div>

        {/* 2×2 grid */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { concept: CONCEPTS[0], Component: ConceptA },
            { concept: CONCEPTS[1], Component: ConceptB },
            { concept: CONCEPTS[2], Component: ConceptC },
            { concept: CONCEPTS[3], Component: ConceptD },
          ].map(({ concept, Component }) => (
            <div key={concept.id} className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm overflow-hidden">
              {/* Concept label */}
              <div className="px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#1a4e8a] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {concept.id}
                  </span>
                  <span className="text-[15px] font-bold text-gray-900">{concept.title}</span>
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">{concept.description}</p>
              </div>

              {/* Component preview */}
              <div className="px-6 py-5">
                <Component />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
