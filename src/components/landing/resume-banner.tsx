"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface ResumeBannerProps {
  resumeToken: string;
  progress: string;
}

export function ResumeBanner({ resumeToken, progress }: ResumeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Link
        href={`/resume/${resumeToken}`}
        className="mt-8 flex w-full max-w-2xl items-center justify-between rounded-xl border px-6 py-4 transition-colors hover:border-[var(--red)]"
        style={{
          borderColor: "var(--red)",
          backgroundColor: "rgba(227, 25, 55, 0.1)",
        }}
      >
        <div className="flex flex-col gap-1">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--gray-100)" }}
          >
            Έχετε ανοιχτή συνομιλία
          </span>
          <span className="text-xs" style={{ color: "var(--gray-500)" }}>
            {progress}
          </span>
        </div>

        <ArrowRight
          className="h-5 w-5 shrink-0"
          style={{ color: "var(--red)" }}
        />
      </Link>
    </motion.div>
  );
}
