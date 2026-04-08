"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  QUESTIONNAIRE_SECTIONS,
  TOTAL_SECTIONS,
} from "@/lib/constants/questionnaire";
import type { AssistantSession } from "@/types/database";

import { LiveTranscript, type TranscriptEntry } from "./live-transcript";
import { ProgressBar } from "./progress-bar";
import { VoiceControls } from "./voice-controls";
import { VoiceOrb } from "./voice-orb";

interface VoiceSessionProps {
  session: AssistantSession;
  dynamicVariables?: Record<string, string>;
}

export function VoiceSession(props: VoiceSessionProps) {
  return (
    <ConversationProvider>
      <VoiceSessionInner {...props} />
    </ConversationProvider>
  );
}

function VoiceSessionInner({ session, dynamicVariables }: VoiceSessionProps) {
  const router = useRouter();

  const [isMuted, setIsMuted] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>(
    [],
  );
  const [currentSection, setCurrentSection] = useState(
    session.progress_section || 1,
  );

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
      console.error("ElevenLabs conversation error:", error);
    },
    onDisconnect: () => {
      router.push(`/session/${session.id}/complete`);
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

      const response = await fetch("/api/signed-url");
      if (!response.ok) {
        console.error("Failed to fetch signed URL");
        return;
      }
      const { signedUrl } = await response.json();

      const sectionName =
        QUESTIONNAIRE_SECTIONS.find((s) => s.number === currentSection)?.name ??
        "";

      await conversation.startSession({
        signedUrl,
        dynamicVariables: {
          session_id: session.id,
          client_name: session.client_name ?? "",
          mode: session.mode,
          current_section: String(currentSection),
          current_section_name: sectionName,
          ...dynamicVariables,
        },
      });
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  }, [conversation, session, currentSection, dynamicVariables]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        conversation.setVolume({ volume: 0 });
      } else {
        conversation.setVolume({ volume: 1 });
      }
      return next;
    });
  }, [conversation]);

  const handlePause = useCallback(async () => {
    try {
      await fetch("/api/agent/pause-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
    } catch (err) {
      console.error("Failed to pause session:", err);
    }
    await conversation.endSession();
  }, [conversation, session.id]);

  const handleEnd = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isActive =
    conversation.status === "connected" || conversation.status === "connecting";
  const isDiscovery = session.mode === "discovery";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between px-4 py-8">
      {/* Top — Progress or mode badge */}
      <div className="flex w-full justify-center">
        {isDiscovery ? (
          <ProgressBar
            currentSection={currentSection}
            totalSections={TOTAL_SECTIONS}
          />
        ) : (
          <span className="rounded-full border border-[var(--gray-700)] px-4 py-1.5 text-sm text-[var(--gray-300)]">
            Support
          </span>
        )}
      </div>

      {/* Center — Orb + start/status */}
      <div className="flex flex-col items-center gap-6">
        <VoiceOrb
          status={conversation.status}
          isSpeaking={conversation.isSpeaking}
        />

        {conversation.status === "disconnected" && (
          <button
            type="button"
            onClick={startConversation}
            className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--red)" }}
          >
            Start
          </button>
        )}

        {conversation.status === "connecting" && (
          <p className="text-sm text-[var(--gray-400)]">Connecting...</p>
        )}

        {conversation.status === "connected" && (
          <p className="text-sm text-[var(--gray-400)]">
            {conversation.isSpeaking ? "Speaking..." : "Listening..."}
          </p>
        )}
      </div>

      {/* Bottom — Controls */}
      <VoiceControls
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onPause={handlePause}
        onEnd={handleEnd}
        isActive={isActive}
      />

      {/* Side — Transcript */}
      <LiveTranscript
        entries={transcriptEntries}
        isOpen={transcriptOpen}
        onToggle={() => setTranscriptOpen((prev) => !prev)}
      />
    </div>
  );
}
