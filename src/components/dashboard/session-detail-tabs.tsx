"use client";

import { useState } from "react";
import type {
  AssistantSession,
  AssistantAnswer,
  AssistantTranscript,
  AssistantFeatureRequest,
  AssistantIssue,
} from "@/types/database";
import { TabSummary } from "@/components/dashboard/tab-summary";
import { TabTranscript } from "@/components/dashboard/tab-transcript";
import { TabAnswers } from "@/components/dashboard/tab-answers";
import { TabFeatureRequests } from "@/components/dashboard/tab-feature-requests";
import { TabIssues } from "@/components/dashboard/tab-issues";

interface SessionDetailTabsProps {
  session: AssistantSession;
  answers: AssistantAnswer[];
  transcript: AssistantTranscript | null;
  featureRequests: AssistantFeatureRequest[];
  issues: AssistantIssue[];
}

type TabKey = "summary" | "transcript" | "answers" | "features" | "issues";

interface TabConfig {
  key: TabKey;
  label: string;
  isVisible: boolean;
}

export function SessionDetailTabs({
  session,
  answers,
  transcript,
  featureRequests,
  issues,
}: SessionDetailTabsProps) {
  const tabs: TabConfig[] = [
    { key: "summary", label: "Σύνοψη", isVisible: true },
    { key: "transcript", label: "Μεταγραφή", isVisible: true },
    {
      key: "answers",
      label: "Απαντήσεις",
      isVisible: session.mode === "discovery",
    },
    { key: "features", label: "Feature Requests", isVisible: true },
    { key: "issues", label: "Issues", isVisible: true },
  ];

  const visibleTabs = tabs.filter((t) => t.isVisible);
  const [activeTab, setActiveTab] = useState<TabKey>(
    visibleTabs[0]?.key ?? "summary",
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tab buttons */}
      <div
        className="flex gap-0 border-b"
        style={{ borderColor: "var(--gray-700)" }}
      >
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative px-4 py-2.5 text-sm font-medium transition-colors"
              style={{
                color: isActive ? "var(--gray-100)" : "var(--gray-500)",
              }}
            >
              {tab.label}
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 h-0.5 w-full"
                  style={{ backgroundColor: "var(--red)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "summary" && (
          <TabSummary
            transcript={transcript}
            answers={answers}
            totalSections={session.progress_total}
          />
        )}
        {activeTab === "transcript" && (
          <TabTranscript transcript={transcript} />
        )}
        {activeTab === "answers" && <TabAnswers answers={answers} />}
        {activeTab === "features" && (
          <TabFeatureRequests featureRequests={featureRequests} />
        )}
        {activeTab === "issues" && <TabIssues issues={issues} />}
      </div>
    </div>
  );
}
