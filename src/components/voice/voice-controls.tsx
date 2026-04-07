"use client";

import { Mic, MicOff, Pause, Square } from "lucide-react";

interface VoiceControlsProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onEnd: () => void;
  isActive: boolean;
}

export function VoiceControls({
  isMuted,
  onToggleMute,
  onPause,
  onEnd,
  isActive,
}: VoiceControlsProps) {
  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center gap-6">
      {/* Mute */}
      <button
        type="button"
        onClick={onToggleMute}
        className="flex h-14 w-14 items-center justify-center rounded-full border transition-colors hover:border-[var(--red)] hover:bg-[var(--red)]/10"
        style={{
          borderColor: isMuted ? "var(--red)" : "var(--gray-700)",
          backgroundColor: isMuted ? "rgba(227, 25, 55, 0.1)" : "transparent",
        }}
        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMuted ? (
          <MicOff size={22} color="var(--red)" />
        ) : (
          <Mic size={22} color="var(--gray-300)" />
        )}
      </button>

      {/* Pause */}
      <button
        type="button"
        onClick={onPause}
        className="flex h-14 w-14 items-center justify-center rounded-full border transition-colors hover:border-yellow-500 hover:bg-yellow-500/10"
        style={{ borderColor: "var(--gray-700)" }}
        aria-label="Pause session"
      >
        <Pause size={22} color="var(--gray-300)" />
      </button>

      {/* End */}
      <button
        type="button"
        onClick={onEnd}
        className="flex h-14 w-14 items-center justify-center rounded-full border transition-colors hover:border-[var(--red)] hover:bg-[var(--red)]/10"
        style={{ borderColor: "var(--gray-700)" }}
        aria-label="End session"
      >
        <Square size={20} color="var(--gray-300)" />
      </button>
    </div>
  );
}
