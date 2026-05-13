"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
} from "recharts";

const CHART_DATA = [
  { name: "Educator / Student\nNeed", educator: 13, student: 14 },
  { name: "Educator / Student\nTypical", educator: 67, student: 65 },
  { name: "Educator / Student\nStrength", educator: 21, student: 22 },
];

const GROUP_COLORS = ["#f38b8b", "#7ab5de", "#7dc49a"];

interface LabelProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  value?: number;
}

function InsideLabel({ x = 0, y = 0, width = 0, height = 0, value = 0 }: LabelProps) {
  if (height < 18) return null;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2 + 5}
      textAnchor="middle"
      fill="#fff"
      fontSize={11}
      fontWeight={700}
    >
      {value}%
    </text>
  );
}

interface TickProps {
  x?: number | string;
  y?: number | string;
  payload?: { value: string };
}

function MultilineTick({ x = 0, y = 0, payload }: TickProps) {
  const numX = typeof x === "string" ? parseFloat(x) : x;
  const numY = typeof y === "string" ? parseFloat(y) : y;
  const lines = (payload?.value ?? "").split("\n");
  return (
    <g transform={`translate(${numX},${numY})`}>
      {lines.map((line, i) => (
        <text key={i} x={0} dy={14 + i * 13} textAnchor="middle" fill="#6b7280" fontSize={11}>
          {line}
        </text>
      ))}
    </g>
  );
}

export function MyStudentsCard() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[15px] text-gray-900">My Students</span>
          <span className="text-[15px] text-gray-500">25-26 Mid</span>
        </div>
        <Link href="#" className="text-sm font-medium text-[#1565c0] hover:underline">
          View Details
        </Link>
      </div>

      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={CHART_DATA}
          barGap={3}
          barCategoryGap="28%"
          margin={{ top: 0, right: 8, left: -24, bottom: 32 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={(props) => <MultilineTick {...props} />}
            interval={0}
          />
          <YAxis hide domain={[0, 90]} />

          <Bar dataKey="educator" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {CHART_DATA.map((_, i) => (
              <Cell key={i} fill={GROUP_COLORS[i]} />
            ))}
            <LabelList content={<InsideLabel />} />
          </Bar>

          <Bar dataKey="student" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {CHART_DATA.map((_, i) => (
              <Cell key={i} fill={GROUP_COLORS[i]} fillOpacity={0.8} />
            ))}
            <LabelList content={<InsideLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
