"use client";

import type { KnowledgeCategory } from "@/types/database";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const CATEGORIES: { value: KnowledgeCategory; label: string }[] = [
  { value: "project_spec", label: "Project Spec" },
  { value: "how_to", label: "How To" },
  { value: "faq", label: "FAQ" },
  { value: "release_notes", label: "Release Notes" },
  { value: "client_profile", label: "Client Profile" },
];

export function KnowledgeUpload() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<KnowledgeCategory>("faq");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/knowledge/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Upload failed");
      }

      toast.success("Knowledge entry created");
      setTitle("");
      setCategory("faq");
      setContent("");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "var(--gray-900)",
        borderColor: "var(--gray-700)",
      }}
    >
      <h2
        className="mb-4 text-lg font-semibold"
        style={{ color: "var(--gray-100)" }}
      >
        Προσθήκη Knowledge Entry
      </h2>

      <div className="flex flex-col gap-4">
        {/* Title + Category row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kb-title"
              className="text-sm font-medium"
              style={{ color: "var(--gray-300)" }}
            >
              Τίτλος
            </label>
            <input
              id="kb-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="π.χ. Πώς λειτουργεί η τιμολόγηση"
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
              style={{
                backgroundColor: "var(--dark)",
                borderColor: "var(--gray-700)",
                color: "var(--gray-100)",
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="kb-category"
              className="text-sm font-medium"
              style={{ color: "var(--gray-300)" }}
            >
              Κατηγορία
            </label>
            <select
              id="kb-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as KnowledgeCategory)}
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
              style={{
                backgroundColor: "var(--dark)",
                borderColor: "var(--gray-700)",
                color: "var(--gray-100)",
              }}
            >
              {CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="kb-content"
            className="text-sm font-medium"
            style={{ color: "var(--gray-300)" }}
          >
            Περιεχόμενο
          </label>
          <textarea
            id="kb-content"
            required
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Γράψτε ή επικολλήστε το περιεχόμενο..."
            className="resize-y rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
            style={{
              backgroundColor: "var(--dark)",
              borderColor: "var(--gray-700)",
              color: "var(--gray-100)",
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-fit items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
          style={{ backgroundColor: "var(--red)" }}
        >
          <Upload size={16} />
          {isSubmitting ? "Αποθήκευση..." : "Αποθήκευση"}
        </button>
      </div>
    </form>
  );
}
