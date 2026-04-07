"use client";

import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";

interface ProgressBarProps {
  currentSection: number;
  totalSections: number;
}

export function ProgressBar({
  currentSection,
  totalSections,
}: ProgressBarProps) {
  const sectionName =
    QUESTIONNAIRE_SECTIONS.find((s) => s.number === currentSection)?.name ?? "";
  const percentage = Math.round((currentSection / totalSections) * 100);

  return (
    <div className="w-full max-w-md">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-[var(--gray-300)]">
          {currentSection}/{totalSections}
        </span>
        <span className="text-[var(--gray-500)]">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--gray-700)]">
        <div
          className="h-full rounded-full bg-[var(--red)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {sectionName && (
        <p className="mt-1 text-xs text-[var(--gray-500)]">{sectionName}</p>
      )}
    </div>
  );
}
