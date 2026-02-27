"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiPost } from "@/lib/api";
import { clearAuthChallenge, setAuthChallenge, setAuthSession } from "@/lib/auth";

type LoginResponse = {
  user?: {
    id: number;
    name: string;
    email: string;
    role?: "admin" | "staff" | "manager" | "installer" | "customer";
  };
  token?: string;
  token_expires_at?: string | null;
  requires_two_factor?: boolean;
  challenge_token?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiPost<LoginResponse>("/auth/login", { email, password });

      if (response.requires_two_factor && response.challenge_token) {
        clearAuthChallenge();
        setAuthChallenge({ challengeToken: response.challenge_token, email });
        router.push("/auth/2fa");
        return;
      }

      if (!response.token || !response.user) {
        throw new Error("Unexpected login response.");
      }

      setAuthSession({
        token: response.token,
        user: response.user,
        token_expires_at: response.token_expires_at,
      });
      clearAuthChallenge();
      router.push("/plants");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto mt-24 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">EMS Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in with your account credentials.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
