"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
} from "recharts";

const GRADE_DATA = [
  { grade: "1st",  need: 12, typical: 68, strength: 20 },
  { grade: "2nd",  need: 15, typical: 64, strength: 21 },
  { grade: "3rd",  need: 12, typical: 65, strength: 23 },
  { grade: "4th",  need: 13, typical: 65, strength: 21 },
  { grade: "5th",  need: 13, typical: 67, strength: 21 },
  { grade: "6th",  need: 14, typical: 66, strength: 21 },
  { grade: "7th",  need: 15, typical: 64, strength: 21 },
  { grade: "8th",  need: 12, typical: 67, strength: 21 },
  { grade: "9th",  need: 15, typical: 68, strength: 17 },
  { grade: "10th", need: 12, typical: 69, strength: 19 },
  { grade: "11th", need: 14, typical: 68, strength: 18 },
  { grade: "12th", need: 13, typical: 68, strength: 20 },
];

const COLORS = {
  need: "#f38b8b",
  typical: "#7ab5de",
  strength: "#7dc49a",
};

interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

function StackLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  if (height < 16 || !value) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 4}
      textAnchor="middle"
      fill="#fff"
      fontSize={10}
      fontWeight={600}
    >
      {value}%
    </text>
  );
}

interface LegendPayload {
  value: string;
  color: string;
}

function CustomLegend({ payload }: { payload?: LegendPayload[] }) {
  const labels: Record<string, string> = {
    need: "Need for Instruction",
    typical: "Typical",
    strength: "Strength",
  };
  return (
    <div className="flex items-center justify-center gap-6 mt-2">
      {(payload ?? []).map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[12px] text-gray-600">{labels[entry.value] ?? entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function GradeLevelComparison() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[15px] text-gray-900">Grade Level Comparison</span>
          <span className="text-[15px] text-gray-500">25-26 Mid</span>
        </div>
        <Link href="#" className="text-sm font-medium text-[#1565c0] hover:underline">
          View Details
        </Link>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={GRADE_DATA}
          barCategoryGap="18%"
          margin={{ top: 4, right: 8, left: 0, bottom: 40 }}
        >
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="grade"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            label={{
              value: "Student Grade Level",
              position: "insideBottom",
              offset: -24,
              fill: "#6b7280",
              fontSize: 12,
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b7280", fontSize: 11 }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            label={{
              value: "% of Students",
              angle: -90,
              position: "insideLeft",
              offset: 12,
              fill: "#6b7280",
              fontSize: 12,
            }}
          />
          <Legend content={<CustomLegend />} verticalAlign="bottom" wrapperStyle={{ paddingTop: 8 }} />

          <Bar dataKey="need" stackId="a" fill={COLORS.need} isAnimationActive={false}>
            <LabelList content={<StackLabel />} />
          </Bar>
          <Bar dataKey="typical" stackId="a" fill={COLORS.typical} isAnimationActive={false}>
            <LabelList content={<StackLabel />} />
          </Bar>
          <Bar dataKey="strength" stackId="a" fill={COLORS.strength} radius={[2, 2, 0, 0]} isAnimationActive={false}>
            <LabelList content={<StackLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
