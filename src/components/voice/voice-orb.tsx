"use client";

import { motion } from "framer-motion";

import type { ConversationStatus } from "@elevenlabs/react";

interface VoiceOrbProps {
  status: ConversationStatus;
  isSpeaking: boolean;
}

const COLORS = {
  red: "#E31937",
  gray700: "#4A4A4A",
} as const;

export function VoiceOrb({ status, isSpeaking }: VoiceOrbProps) {
  const isConnected = status === "connected";
  const isConnecting = status === "connecting";
  const isActive = isConnected || isConnecting;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 120,
          height: 120,
          background: isConnected
            ? `radial-gradient(circle, ${COLORS.red}33 0%, transparent 70%)`
            : `radial-gradient(circle, ${COLORS.gray700}33 0%, transparent 70%)`,
        }}
        animate={
          isConnected
            ? {
                scale: isSpeaking ? [1, 1.4, 1] : [1, 1.15, 1],
                opacity: isSpeaking ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3],
              }
            : isConnecting
              ? { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }
              : { scale: 1, opacity: 0.1 }
        }
        transition={
          isActive
            ? {
                duration: isSpeaking ? 0.8 : 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0.3 }
        }
      />

      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full border-2"
        style={{
          width: 72,
          height: 72,
          borderColor: isConnected ? COLORS.red : COLORS.gray700,
        }}
        animate={
          isConnected && isSpeaking
            ? { scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }
            : isConnecting
              ? { scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }
              : { scale: 1, opacity: 0.4 }
        }
        transition={
          isActive
            ? {
                duration: isSpeaking ? 0.6 : 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : { duration: 0.3 }
        }
      />

      {/* Core */}
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 56,
          height: 56,
          backgroundColor: isConnected ? COLORS.red : COLORS.gray700,
        }}
        animate={isConnecting ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={
          isConnecting
            ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3 }
        }
      >
        <span className="text-lg font-bold text-white select-none">M</span>
      </motion.div>
    </div>
  );
}
