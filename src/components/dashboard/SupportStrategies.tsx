"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MetricCardProps {
  label: string;
  value: number | string;
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 flex-1">
      <p className="text-[14px] font-bold text-gray-900 mb-3">{label}</p>
      <p className="text-[48px] font-bold text-gray-900 leading-none">{value}</p>
    </div>
  );
}

export function SupportStrategies() {
  return (
    <div className="bg-white rounded-lg border border-[#e2e8f0] p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[15px] text-gray-900">Support Strategies</span>
          <span className="text-[15px] text-gray-500">2025-2026</span>
        </div>
        <Link href="#" className="text-sm font-medium text-[#1565c0] hover:underline">
          View Details
        </Link>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overall">
        <TabsList className="bg-transparent border-0 p-0 h-auto mb-5 gap-0">
          <TabsTrigger
            value="overall"
            className="
              rounded-none border-b-2 border-transparent px-0 pb-2 mr-6
              text-[13px] font-medium text-gray-600
              data-[state=active]:border-[#1a4e8a] data-[state=active]:text-gray-900
              data-[state=active]:bg-transparent data-[state=active]:shadow-none
              hover:text-gray-900
            "
          >
            Overall Metrics
          </TabsTrigger>
          <TabsTrigger
            value="mine"
            className="
              rounded-none border-b-2 border-transparent px-0 pb-2
              text-[13px] font-medium text-gray-600
              data-[state=active]:border-[#1a4e8a] data-[state=active]:text-gray-900
              data-[state=active]:bg-transparent data-[state=active]:shadow-none
              hover:text-gray-900
            "
          >
            My Support Strategies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="mt-0">
          <div className="flex gap-4">
            <MetricCard label="Support Strategies Created" value={1} />
            <MetricCard label="Students with Support Strategies" value={1} />
          </div>
        </TabsContent>

        <TabsContent value="mine" className="mt-0">
          <div className="flex gap-4">
            <MetricCard label="My Support Strategies" value={0} />
            <MetricCard label="Students in My Strategies" value={0} />
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <div className="mt-6">
        <button className="bg-[#1a4e8a] hover:bg-[#143d6b] text-white text-[14px] font-medium px-5 py-3 rounded-md transition-colors">
          + New Support Strategy
        </button>
      </div>
    </div>
  );
}
