import { AppShell } from "@/components/layout/AppShell";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="flex-1 min-w-0">{children}</div>
    </AppShell>
  );
}
