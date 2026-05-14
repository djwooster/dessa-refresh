import { AppShell } from "@/components/layout/AppShell";
import { ReportsNav } from "./ReportsNav";

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex min-h-full">
        <aside className="w-[220px] shrink-0 bg-white border-r border-[#e8ecf0]">
          <div className="sticky top-0">
            <div className="px-4 py-5 border-b border-[#e8ecf0]">
              <h2 className="text-[15px] font-semibold text-gray-900">Reports</h2>
            </div>
            <nav className="px-2 py-3">
              <ReportsNav />
            </nav>
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
