"use client";

import { useCallback, useState } from "react";
import { Mic } from "lucide-react";
import { MissionProgress } from "@/components/client/mission-progress";
import { MissingSections } from "@/components/client/missing-sections";
import { RecentAnswers } from "@/components/client/recent-answers";
import { ConversationHistory } from "@/components/client/conversation-history";
import { VoiceInline } from "@/components/client/voice-inline";
import type { MissionState } from "@/types/database";
import { calculateProgress } from "@/lib/mission";

interface ClientDashboardProps {
  initialState: MissionState;
}

export function ClientDashboard({ initialState }: ClientDashboardProps) {
  const [missionState, setMissionState] = useState(initialState);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const refreshMission = useCallback(async () => {
    const res = await fetch("/api/mission");
    if (res.ok) {
      const data = await res.json();
      setMissionState(data);
    }
  }, []);

  const handleSessionEnd = useCallback(() => {
    setIsVoiceActive(false);
    refreshMission();
  }, [refreshMission]);

  const progress = calculateProgress(missionState.sections);
  const completeSections = missionState.sections.filter(
    (s) => s.status === "complete",
  ).length;

  if (isVoiceActive) {
    return (
      <div className="min-h-screen px-4">
        <VoiceInline
          missionState={missionState}
          onSessionEnd={handleSessionEnd}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: "var(--red)" }}
        >
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">MotoMarket Discovery</h1>
          <p className="text-xs" style={{ color: "var(--gray-500)" }}>
            Ανάλυση Απαιτήσεων ERP & WMS
          </p>
        </div>
      </div>

      {/* Progress */}
      <MissionProgress
        percentage={progress}
        completeSections={completeSections}
        totalSections={missionState.sections.length}
      />

      {/* CTA */}
      <button
        onClick={() => setIsVoiceActive(true)}
        className="flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--red)" }}
      >
        <Mic className="h-5 w-5" />
        {missionState.conversations.length === 0
          ? "Ξεκινήστε τη συνομιλία"
          : "Συνεχίστε τη συνομιλία"}
      </button>
      {missionState.nextSection && (
        <p
          className="-mt-4 text-center text-xs"
          style={{ color: "var(--gray-500)" }}
        >
          Επόμενη ενότητα: {missionState.nextSection.name}
        </p>
      )}

      {/* Missing sections */}
      <MissingSections sections={missionState.sections} />

      {/* Recent answers */}
      <RecentAnswers answers={missionState.recentAnswers} />

      {/* History */}
      <ConversationHistory conversations={missionState.conversations} />

      {/* Footer */}
      <p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--gray-500)" }}
      >
        ΕΜΠΙΣΤΕΥΤΙΚΟ — MotoMarket © 2026
      </p>
    </div>
  );
}
