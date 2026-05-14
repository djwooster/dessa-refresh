"use client";

import { useState } from "react";
import { Users, UserCog, GraduationCap, ExternalLink, ArrowRight } from "lucide-react";

const IMPORT_TYPES = [
  {
    id: "sites-educators-students",
    label: "Sites, Educators, Students",
    description: "Bulk import sites, educator accounts, and student rosters",
    icon: Users,
  },
  {
    id: "site-leaders",
    label: "Site Leaders",
    description: "Import site leader accounts and assign permissions",
    icon: UserCog,
  },
  {
    id: "training-only",
    label: "Training Only Users",
    description: "Add users with access to training resources only",
    icon: GraduationCap,
  },
];

const RESOURCES = [
  "Templates and file formatting guide",
  "Step-by-Step Instructions",
  "Imports video tutorial",
];

export default function ImportsPage() {
  const [selected, setSelected] = useState("sites-educators-students");

  return (
    <div className="p-6 max-w-[820px]">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900">Imports</h1>
      </div>

      <div className="bg-white rounded-xl border border-[#e8ecf0] shadow-sm p-6 mb-4">
        <p className="text-[13.5px] font-semibold text-gray-800 mb-4">
          What would you like to import?
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {IMPORT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = selected === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={`flex flex-col items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                  isSelected
                    ? "border-[#1a4e8a] bg-[#eef2f8]"
                    : "border-[#e8ecf0] bg-white hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected ? "bg-[#1a4e8a]" : "bg-gray-100"
                  }`}
                >
                  <Icon
                    size={15}
                    strokeWidth={1.75}
                    className={isSelected ? "text-white" : "text-gray-500"}
                  />
                </div>
                <div>
                  <p
                    className={`text-[13.5px] font-semibold mb-0.5 ${
                      isSelected ? "text-[#1a4e8a]" : "text-gray-800"
                    }`}
                  >
                    {type.label}
                  </p>
                  <p className="text-[12px] text-gray-400 leading-relaxed">
                    {type.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="border-t border-[#f0f4f8] pt-5 space-y-2.5">
          {RESOURCES.map((r) => (
            <a
              key={r}
              href="#"
              className="flex items-center gap-2 text-[13.5px] text-[#1565c0] hover:underline"
            >
              <ExternalLink size={13} strokeWidth={1.75} className="shrink-0" />
              {r}
            </a>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 h-9 px-5 rounded-lg bg-[#1a4e8a] text-white text-[13px] font-semibold hover:bg-[#15407a] transition-colors">
          Continue
          <ArrowRight size={14} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
