"use client";

import { motion } from "framer-motion";
import { Headphones, Mic } from "lucide-react";
import Link from "next/link";

interface ModeCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  delay: number;
}

function ModeCard({
  href,
  icon,
  iconBg,
  title,
  subtitle,
  delay,
}: ModeCardProps) {
  return (
    <Link href={href} className="w-full md:w-auto">
      <motion.div
        className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border px-8 py-8 transition-colors"
        style={{
          borderColor: "var(--gray-700)",
          backgroundColor: "var(--gray-900)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        whileHover={{
          scale: 1.03,
          borderColor: "var(--red)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          {icon}
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--gray-100)" }}
          >
            {title}
          </h2>
          <p className="text-sm" style={{ color: "var(--gray-500)" }}>
            {subtitle}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

export function ModeSelector() {
  return (
    <div className="mt-10 flex w-full max-w-2xl flex-col gap-4 md:flex-row">
      <ModeCard
        href="/session/new?mode=discovery"
        icon={<Mic className="h-7 w-7 text-white" />}
        iconBg="var(--red)"
        title="Ανάλυση Απαιτήσεων"
        subtitle="Structured interview για ERP & WMS"
        delay={0.2}
      />
      <ModeCard
        href="/session/new?mode=support"
        icon={<Headphones className="h-7 w-7 text-white" />}
        iconBg="var(--gray-700)"
        title="Υποστήριξη & Ερωτήσεις"
        subtitle="Ρωτήστε ό,τι θέλετε"
        delay={0.35}
      />
    </div>
  );
}
