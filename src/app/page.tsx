import { AppHeader } from "@/components/layout/AppHeader";
import { TimelineCard } from "@/components/dashboard/TimelineCard";
import { MyStudentsCard } from "@/components/dashboard/MyStudentsCard";
import { GradeLevelComparison } from "@/components/dashboard/GradeLevelComparison";
import { SupportStrategies } from "@/components/dashboard/SupportStrategies";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#edf1f6] flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-[1080px] w-full mx-auto px-6 py-8">
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
          <TimelineCard />
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
      </main>
    </div>
  );
}
