import { AppShell } from "@/components/layout/AppShell";
import { SettingsNav } from "./SettingsNav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex min-h-full">
        {/* Settings sub-nav */}
        <aside className="w-[200px] shrink-0 bg-white border-r border-[#e8ecf0]">
          <div className="sticky top-0">
            <div className="px-4 py-5 border-b border-[#e8ecf0]">
              <h2 className="text-[15px] font-semibold text-gray-900">Settings</h2>
            </div>
            <nav className="px-2 py-3">
              <SettingsNav />
            </nav>
          </div>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
