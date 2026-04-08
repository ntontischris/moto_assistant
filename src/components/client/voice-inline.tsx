"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState } from "react";
import { VoiceOrb } from "@/components/voice/voice-orb";
import { VoiceControls } from "@/components/voice/voice-controls";
import { ProgressBar } from "@/components/voice/progress-bar";
import type { TranscriptEntry } from "@/components/voice/live-transcript";
import { TOTAL_SECTIONS } from "@/lib/constants/questionnaire";
import type { MissionState } from "@/types/database";

interface VoiceInlineProps {
  missionState: MissionState;
  onSessionEnd: () => void;
}

function VoiceInlineInner({ missionState, onSessionEnd }: VoiceInlineProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [],
  );
  const [currentSection, setCurrentSection] = useState(
    missionState.nextSection?.number ?? 1,
  );
  const isEndingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const conversation = useConversation({
    onMessage: (message) => {
      if (message && typeof message === "object" && "message" in message) {
        const msg = message as { message: string; source: string };
        if (msg.message) {
          setTranscriptEntries((prev) => [
            ...prev,
            {
              speaker: msg.source === "user" ? "user" : "agent",
              text: msg.message,
              timestamp: new Date().toLocaleTimeString("el-GR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      }
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
    },
    onDisconnect: () => {
      if (isEndingRef.current && conversationIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        fetch("/api/conversations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationIdRef.current,
            status: "completed",
            duration_seconds: duration,
          }),
        }).finally(() => {
          onSessionEnd();
        });
      }
    },
    clientTools: {
      update_progress: async (params: { section_number?: number }) => {
        const section = params.section_number ?? currentSection + 1;
        setCurrentSection(section);
        return `Progress updated to section ${section}`;
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const convRes = await fetch("/api/conversations", { method: "POST" });
      if (!convRes.ok) return;
      const { id: convId } = await convRes.json();
      conversationIdRef.current = convId;
      startTimeRef.current = Date.now();

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) return;

      await conversation.startSession({
        agentId,
        connectionType: "websocket",
        dynamicVariables: {
          conversation_id: convId,
          mission_progress: String(missionState.mission.progress_percentage),
          previous_answers: missionState.allAnswersSummary.slice(0, 3000),
          missing_sections: missionState.missingSectionNumbers.join(","),
          next_section: String(missionState.nextSection?.number ?? 1),
          next_section_name: missionState.nextSection?.name ?? "",
          conversation_number: String(missionState.conversations.length + 1),
          is_resumed: missionState.conversations.length > 0 ? "true" : "false",
        },
      });
    } catch (err) {
      console.error("Failed to start:", err);
    }
  }, [conversation, missionState]);

  const handlePause = useCallback(async () => {
    isEndingRef.current = true;
    await conversation.endSession();
  }, [conversation]);

  const handleEnd = useCallback(async () => {
    isEndingRef.current = true;
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-between py-8">
      <div className="w-full max-w-md">
        <ProgressBar
          currentSection={currentSection}
          totalSections={TOTAL_SECTIONS}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <VoiceOrb
          status={conversation.status}
          isSpeaking={conversation.isSpeaking}
        />

        {conversation.status === "disconnected" && (
          <button
            onClick={startConversation}
            className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--red)" }}
          >
            Ξεκινήστε
          </button>
        )}

        {conversation.status === "connecting" && (
          <p className="text-sm" style={{ color: "var(--gray-400)" }}>
            Σύνδεση...
          </p>
        )}

        {conversation.status === "connected" && (
          <p className="text-sm" style={{ color: "var(--gray-400)" }}>
            {conversation.isSpeaking ? "Ο βοηθός μιλάει..." : "Ακούω..."}
          </p>
        )}
      </div>

      <VoiceControls
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onPause={handlePause}
        onEnd={handleEnd}
        isActive={conversation.status === "connected"}
      />

      {transcriptEntries.length > 0 && (
        <div
          className="mt-4 w-full max-w-md space-y-2 rounded-xl border p-4"
          style={{ borderColor: "var(--gray-700)" }}
        >
          <h4
            className="text-xs font-semibold"
            style={{ color: "var(--gray-500)" }}
          >
            Μεταγραφή
          </h4>
          {transcriptEntries.slice(-5).map((e, i) => (
            <div
              key={i}
              className="text-sm"
              style={{
                color:
                  e.speaker === "agent" ? "var(--gray-400)" : "var(--gray-200)",
              }}
            >
              <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                {e.speaker === "agent" ? "Βοηθός" : "Εσείς"}:
              </span>{" "}
              {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VoiceInline(props: VoiceInlineProps) {
  return (
    <ConversationProvider>
      <VoiceInlineInner {...props} />
    </ConversationProvider>
  );
}
