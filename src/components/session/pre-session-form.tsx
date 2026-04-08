"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PreSessionFormProps {
  mode: "discovery" | "support";
}

type MicStatus = "idle" | "testing" | "success" | "error";

export function PreSessionForm({ mode }: PreSessionFormProps) {
  const router = useRouter();

  const [isConsentGiven, setIsConsentGiven] = useState(false);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleMicTest = async () => {
    setMicStatus("testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("success");
    } catch {
      setMicStatus("error");
    }
  };

  const handleStart = async () => {
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: "MotoMarket",
          client_email: "admin@motomarket.gr",
          client_company: "MotoMarket",
          mode,
        }),
      });

      if (!response.ok) {
        setErrorMessage("Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
        return;
      }

      const data = await response.json();
      router.push(`/session/${data.id}`);
    } catch {
      setErrorMessage("Αδυναμία σύνδεσης. Ελέγξτε τη σύνδεσή σας.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-5">
      {/* Mic Test */}
      <button
        type="button"
        onClick={handleMicTest}
        disabled={micStatus === "testing"}
        className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:border-[var(--red)]"
        style={{
          borderColor: "var(--gray-700)",
          backgroundColor: "var(--gray-900)",
          color: "var(--gray-300)",
        }}
      >
        {micStatus === "idle" && "Δοκιμή μικροφώνου"}
        {micStatus === "testing" && "Έλεγχος..."}
        {micStatus === "success" && "Μικρόφωνο OK ✓"}
        {micStatus === "error" && "Δεν βρέθηκε μικρόφωνο — δοκιμάστε ξανά"}
      </button>
      {micStatus === "success" && (
        <p className="text-xs" style={{ color: "#22c55e" }}>
          Το μικρόφωνο λειτουργεί κανονικά.
        </p>
      )}
      {micStatus === "error" && (
        <p className="text-xs" style={{ color: "var(--red)" }}>
          Ενεργοποιήστε το μικρόφωνο στις ρυθμίσεις του browser.
        </p>
      )}

      {/* Consent */}
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={isConsentGiven}
          onChange={(e) => setIsConsentGiven(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--red)]"
        />
        <span className="text-sm" style={{ color: "var(--gray-300)" }}>
          Συμφωνώ να ηχογραφηθεί η συνομιλία
        </span>
      </label>

      {/* Error */}
      {errorMessage && (
        <p className="text-sm" style={{ color: "var(--red)" }}>
          {errorMessage}
        </p>
      )}

      {/* Start */}
      <button
        type="button"
        onClick={handleStart}
        disabled={!isConsentGiven || isSubmitting}
        className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "var(--red)" }}
      >
        {isSubmitting ? "Ετοιμασία..." : "Ξεκινήστε τη συνομιλία"}
      </button>
    </div>
  );
}
