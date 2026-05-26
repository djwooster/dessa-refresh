"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  CalendarClock,
  Zap,
  ClipboardList,
  Plus,
  Trash2,
} from "lucide-react";
import { ConceptC } from "@/components/dashboard/timeline/ConceptC";
import { createClient } from "@/lib/supabase/client";
import type { YearlySetup, YearlySetupSite } from "@/lib/supabase/types";

type SetupWithSites = YearlySetup & { yearly_setup_sites: YearlySetupSite[] };

const ASSESSMENTS = ["Teacher DESSA", "Student DESSA", "SEIR"];

export default function YearlySetupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [defaultSetup, setDefaultSetup] = useState<SetupWithSites | null>(null);
  const [overrides, setOverrides] = useState<SetupWithSites[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("yearly_setups")
        .select("*, yearly_setup_sites(*)")
        .order("created_at", { ascending: true });

      if (data) {
        setDefaultSetup(
          (data as SetupWithSites[]).find((s) => s.is_default) ?? null,
        );
        setOverrides((data as SetupWithSites[]).filter((s) => !s.is_default));
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleting(true);
    await supabase.from("yearly_setups").delete().eq("id", confirmDeleteId);
    if (confirmDeleteId === defaultSetup?.id) {
      setDefaultSetup(null);
    } else {
      setOverrides((prev) => prev.filter((o) => o.id !== confirmDeleteId));
    }
    setConfirmDeleteId(null);
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-[#1a4e8a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">Yearly Setup</h1>
          <p className="text-[16px] text-gray-500">
            Plan your year ahead and set rating window timeframes for each
            school year.
          </p>
        </div>
        {defaultSetup && (
          <button
            onClick={() => setConfirmDeleteId(defaultSetup.id)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-400 hover:text-red-500 transition-colors cursor-pointer mt-1"
          >
            <Trash2 size={12} strokeWidth={1.75} />
            Delete Setup
          </button>
        )}
      </div>

      {/* Default config */}
      {!defaultSetup ? (
        <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#eef2f8] flex items-center justify-center mb-4">
              <CalendarClock
                size={32}
                className="text-[#1a4e8a]"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-[20px] font-semibold text-gray-800 mb-1">
              No yearly setup yet
            </h3>
            <p className="text-[16px] text-gray-500 max-w-sm mb-6">
              Define your rating windows and assessment configuration to get
              started.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/settings/yearly-setup/edit2")}
                className="flex items-center justify-center w-[130px] h-9 rounded-lg bg-[#1a4e8a] text-white text-[16px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
              >
                Setup
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden mb-4">
            <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
              <div>
                <p className="text-[18px] font-semibold text-gray-700 uppercase">
                  2025–2026
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(
                      `/settings/yearly-setup/edit2?id=${defaultSetup.id}`,
                    )
                  }
                  className="flex items-center justify-center w-[130px] h-9 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
                >
                  Edit Setup
                </button>
              </div>
            </div>

            <div className="px-6 py-5 border-b border-[#f0f4f8]">
              <h3 className="text-[13.5px] font-semibold text-gray-800 mb-4">
                Rating windows
              </h3>
              <ConceptC showYearLabel={false} />
            </div>

            <div className="px-6 py-5">
              <h3 className="text-[13.5px] font-semibold text-gray-800 mb-4">
                Assessment configuration
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#f8fafc] rounded-lg border border-[#edf0f4] px-4 py-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Starting Assessment
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#1a4e8a] flex items-center justify-center shrink-0">
                      {defaultSetup.assessment_type === "screener" ? (
                        <Zap
                          size={12}
                          className="text-white"
                          strokeWidth={1.75}
                        />
                      ) : (
                        <ClipboardList
                          size={12}
                          className="text-white"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {defaultSetup.assessment_type === "screener"
                        ? "Screener"
                        : "Full Assessment"}
                    </span>
                  </div>
                </div>
                <div className="bg-[#f8fafc] rounded-lg border border-[#edf0f4] px-4 py-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Conditional Full DESSA
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {defaultSetup.conditional_assignment
                      ? `T-Score ≤ ${defaultSetup.t_score}`
                      : "Disabled"}
                  </p>
                </div>
                <div className="bg-[#f8fafc] rounded-lg border border-[#edf0f4] px-4 py-3">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Assessments
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {ASSESSMENTS.map((a) => (
                      <span
                        key={a}
                        className="inline-block text-[11px] font-medium text-gray-600 bg-white border border-[#e8ecf0] rounded-full px-2 py-0.5"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Site overrides */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">
                  Site Overrides
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Groups of sites that follow a different schedule than the
                  default.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push("/settings/yearly-setup/edit2?override=true")
                  }
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg border border-[#1a4e8a] text-[13px] font-semibold text-[#1a4e8a] hover:bg-[#eef2f8] transition-colors cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2} />
                  Add Override
                </button>
              </div>
            </div>

            {overrides.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm px-6 py-10 text-center">
                <p className="text-sm text-gray-400">
                  No site overrides. All sites use the default setup.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map((override) => (
                  <div
                    key={override.id}
                    className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-6 py-4 bg-[#f8fafc] border-b border-[#e8ecf0]">
                      <div>
                        <p className="text-[14px] font-bold text-gray-900">
                          {override.group_name}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                          {override.yearly_setup_sites
                            .map((s) => s.site_name)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(
                              `/settings/yearly-setup/edit2?id=${override.id}&override=true`,
                            )
                          }
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#1a4e8a] text-white text-[12px] font-semibold hover:bg-[#15407a] transition-colors cursor-pointer"
                        >
                          <Pencil size={11} strokeWidth={1.75} />
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(override.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                    <div className="px-6 py-4">
                      <div className="flex gap-6 text-sm">
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Windows
                          </p>
                          <p className="font-semibold text-gray-800">
                            {override.window_count}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Assessment
                          </p>
                          <p className="font-semibold text-gray-800">
                            {override.assessment_type === "screener"
                              ? "Screener"
                              : "Full Assessment"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Threshold
                          </p>
                          <p className="font-semibold text-gray-800">
                            {override.conditional_assignment
                              ? `T-Score ≤ ${override.t_score}`
                              : "Disabled"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white rounded-xl border border-[#e8ecf0] shadow-xl p-6 w-[400px]">
            <h2 className="text-[16px] font-bold text-gray-900 mb-2">
              {confirmDeleteId === defaultSetup?.id
                ? "Delete this setup?"
                : "Delete override?"}
            </h2>
            <p className="text-[14px] text-gray-500 mb-6">
              {confirmDeleteId === defaultSetup?.id
                ? "All data for this setup will be permanently deleted. This cannot be undone."
                : "Sites in this group will revert to the default yearly setup. This cannot be undone."}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="h-9 px-4 rounded-lg border border-[#d1d5db] text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 px-4 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting
                  ? "Deleting…"
                  : confirmDeleteId === defaultSetup?.id
                    ? "Delete Setup"
                    : "Delete Override"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
