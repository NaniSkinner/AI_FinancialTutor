"use client";

import type { AuditLogEntry } from "@/hooks/useAuditLogs";

interface AuditLogStatsProps {
  logs?: AuditLogEntry[];
  totalCount?: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: string;
}

function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </div>
  );
}

export function AuditLogStats({
  logs = [],
  totalCount = 0,
}: AuditLogStatsProps) {
  // Calculate stats from logs
  const todayCount = logs.filter((log) => {
    const logDate = new Date(log.timestamp).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  const approvalsCount = logs.filter(
    (log) => log.action === "approve" || log.action === "bulk_approve"
  ).length;

  const rejectionsCount = logs.filter((log) => log.action === "reject").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Total Actions" value={totalCount} icon="📊" />
      <StatCard label="Today" value={todayCount} icon="📅" />
      <StatCard label="Approvals" value={approvalsCount} icon="✅" />
      <StatCard label="Rejections" value={rejectionsCount} icon="❌" />
    </div>
  );
}
