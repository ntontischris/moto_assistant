"use client";

import { motion } from "framer-motion";

interface MissionProgressProps {
  percentage: number;
  completeSections: number;
  totalSections: number;
}

export function MissionProgress({
  percentage,
  completeSections,
  totalSections,
}: MissionProgressProps) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        backgroundColor: "var(--gray-900)",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: "var(--gray-700)",
      }}
    >
      <div className="flex items-end justify-between mb-4">
        <span className="text-3xl font-bold" style={{ color: "var(--red)" }}>
          {percentage}%
        </span>
        <span className="text-sm" style={{ color: "var(--gray-500)" }}>
          {completeSections}/{totalSections} ενότητες
        </span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--gray-700)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--red)" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
