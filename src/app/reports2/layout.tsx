import { AppShell } from "@/components/layout/AppShell";
import { ReportsTopNav } from "./ReportsTopNav";

export default function Reports2Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex flex-col min-h-full">
        <ReportsTopNav />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
