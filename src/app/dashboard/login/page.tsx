"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Λάθος email ή κωδικός");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border p-8"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--red)" }}
          >
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--gray-100)" }}
          >
            Admin Login
          </h1>
        </div>

        {error && (
          <p
            className="rounded-lg px-3 py-2 text-center text-sm"
            style={{
              backgroundColor: "rgba(227, 25, 55, 0.1)",
              color: "var(--red)",
            }}
          >
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium"
              style={{ color: "var(--gray-300)" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
              style={{
                backgroundColor: "var(--dark)",
                borderColor: "var(--gray-700)",
                color: "var(--gray-100)",
              }}
              placeholder="admin@motomarket.gr"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium"
              style={{ color: "var(--gray-300)" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
              style={{
                backgroundColor: "var(--dark)",
                borderColor: "var(--gray-700)",
                color: "var(--gray-100)",
              }}
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{
            backgroundColor: isLoading ? "var(--red-dark)" : "var(--red)",
          }}
        >
          {isLoading ? "Σύνδεση..." : "Σύνδεση"}
        </button>
      </form>
    </div>
  );
}
