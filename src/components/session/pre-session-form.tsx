"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

interface PreSessionFormProps {
  mode: "discovery" | "support";
}

type MicStatus = "idle" | "testing" | "success" | "error";

export function PreSessionForm({ mode }: PreSessionFormProps) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_name: name,
          client_email: email,
          client_company: company || undefined,
          mode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data.error ?? "Κάτι πήγε στραβά. Δοκιμάστε ξανά.");
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

  const isFormValid =
    name.trim().length > 0 && email.trim().length > 0 && isConsentGiven;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-5"
    >
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium"
          style={{ color: "var(--gray-300)" }}
        >
          Ονοματεπώνυμο *
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="π.χ. Γιάννης Παπαδόπουλος"
          className="rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--red)]"
          style={{
            borderColor: "var(--gray-700)",
            backgroundColor: "var(--gray-900)",
            color: "var(--gray-100)",
          }}
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: "var(--gray-300)" }}
        >
          Email *
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@company.com"
          className="rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--red)]"
          style={{
            borderColor: "var(--gray-700)",
            backgroundColor: "var(--gray-900)",
            color: "var(--gray-100)",
          }}
        />
      </div>

      {/* Company */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="company"
          className="text-sm font-medium"
          style={{ color: "var(--gray-300)" }}
        >
          Εταιρεία
        </label>
        <input
          id="company"
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="προαιρετικό"
          className="rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--red)]"
          style={{
            borderColor: "var(--gray-700)",
            backgroundColor: "var(--gray-900)",
            color: "var(--gray-100)",
          }}
        />
      </div>

      {/* Mic Test */}
      <div className="flex flex-col gap-1.5">
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
          {micStatus === "success" && "Μικρόφωνο OK"}
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
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
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

      {/* Submit */}
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: "var(--red)" }}
      >
        {isSubmitting ? "Δημιουργία..." : "Ξεκινήστε"}
      </button>
    </form>
  );
}
