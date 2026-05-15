import { AppShell } from "@/components/layout/AppShell";

export default function Reports3Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex-1 min-w-0">{children}</div>
    </AppShell>
  );
}
