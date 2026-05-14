import { AppShell } from "@/components/layout/AppShell";
import { CalendarDays } from "lucide-react";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";
import { MyStudentsCard } from "@/components/dashboard/MyStudentsCard";
import { GradeLevelComparison } from "@/components/dashboard/GradeLevelComparison";
import { SupportStrategies } from "@/components/dashboard/SupportStrategies";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="max-w-[1200px] w-full mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-7">
          <h1 className="text-[28px] font-extrabold text-gray-900 leading-tight mb-1">
            Welcome back, Tara!
          </h1>
          <p className="text-[14px] text-gray-500">
            Let&apos;s assess your students and identify targeted strategies to develop their social and emotional competencies
          </p>
        </div>

        {/* Row 1: Timeline + My Students */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          {/* Timeline — Concept C: School Year Strip */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2.5 mb-1.5">
                <CalendarDays size={16} className="text-slate-700 shrink-0" strokeWidth={1.75} />
                <span className="text-[15px] font-bold text-gray-900">Assessment Timeline</span>
              </div>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Track where you are in the 2025–2026 school year across all three assessment windows.
              </p>
            </div>
            <div className="px-6 py-5">
              <ConceptC />
            </div>
          </div>

          <MyStudentsCard />
        </div>

        {/* Row 2: Grade Level Comparison */}
        <div className="mb-5">
          <GradeLevelComparison />
        </div>

        {/* Row 3: Support Strategies */}
        <div>
          <SupportStrategies />
        </div>
      </div>
    </AppShell>
  );
}
