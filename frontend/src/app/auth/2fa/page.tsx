"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiPost } from "@/lib/api";
import { clearAuthChallenge, getAuthChallenge, setAuthSession } from "@/lib/auth";

type ChallengeResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    role?: "admin" | "staff" | "manager" | "installer" | "customer";
  };
  token: string;
  token_expires_at?: string | null;
};

export default function TwoFactorChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const challenge = getAuthChallenge();
    if (!challenge?.challengeToken) {
      router.replace("/auth/login");
      return;
    }

    setChallengeToken(challenge.challengeToken);
    setEmailHint(challenge.email ?? null);
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!challengeToken) {
      setError("Missing challenge token. Please login again.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = useRecoveryCode
        ? { challenge_token: challengeToken, recovery_code: recoveryCode }
        : { challenge_token: challengeToken, code };

      const response = await apiPost<ChallengeResponse>("/auth/2fa/challenge", payload);

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
        setError("2FA verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto mt-24 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-semibold">Two-factor authentication</h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete sign-in{emailHint ? ` for ${emailHint}` : ""} with your authenticator code or a recovery code.
        </p>

        <div className="mt-4 flex gap-2 text-sm">
          <button
            className={`rounded border px-2 py-1 ${!useRecoveryCode ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900" : "border-slate-300 dark:border-slate-700"}`}
            onClick={() => setUseRecoveryCode(false)}
            type="button"
          >
            Authenticator code
          </button>
          <button
            className={`rounded border px-2 py-1 ${useRecoveryCode ? "border-slate-900 bg-slate-900 text-white dark:border-slate-200 dark:bg-slate-200 dark:text-slate-900" : "border-slate-300 dark:border-slate-700"}`}
            onClick={() => setUseRecoveryCode(true)}
            type="button"
          >
            Recovery code
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          {!useRecoveryCode ? (
            <div>
              <label className="mb-1 block text-sm">6-digit code</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm">Recovery code</label>
              <input
                type="text"
                required
                value={recoveryCode}
                onChange={(event) => setRecoveryCode(event.target.value.toUpperCase())}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-slate-200 dark:text-slate-900"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

          <button
            type="button"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
            onClick={() => {
              clearAuthChallenge();
              router.push("/auth/login");
            }}
          >
            Back to login
          </button>
        </form>
      </div>
    </main>
  );
}
