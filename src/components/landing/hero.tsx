"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl shadow-lg"
        style={{ backgroundColor: "var(--red)" }}
      >
        <span className="text-3xl font-bold text-white">M</span>
      </div>

      <div className="flex flex-col gap-2">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--gray-100)" }}
        >
          Ψηφιακός Βοηθός
        </h1>
        <p className="text-lg" style={{ color: "var(--gray-500)" }}>
          Μιλήστε μας για τις ανάγκες σας — εμείς ακούμε
        </p>
      </div>
    </motion.div>
  );
}
