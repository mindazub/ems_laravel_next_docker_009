"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiDelete, apiGet, apiPost } from "@/lib/api";

type MeResponse = {
  user: {
    id: number;
    two_factor_confirmed_at?: string | null;
  };
};

type SetupResponse = {
  secret: string;
  otpauth_url: string;
  qr_url: string;
};

type ConfirmResponse = {
  message: string;
  recovery_codes: string[];
};

type RegenerateResponse = {
  recovery_codes: string[];
};

export default function SettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [setupPayload, setSetupPayload] = useState<SetupResponse | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [busy, setBusy] = useState(false);

  const loadState = async () => {
    setLoadingState(true);
    setError(null);

    try {
      const payload = await apiGet<MeResponse>("/auth/me");
      setTwoFactorEnabled(Boolean(payload.user.two_factor_confirmed_at));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load security settings.");
      }
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    void loadState();
  }, []);

  const beginSetup = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    setRecoveryCodes([]);

    try {
      const payload = await apiPost<SetupResponse>("/auth/2fa/setup");
      setSetupPayload(payload);
      setMessage("Scan the QR code and confirm with your 6-digit authenticator code.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to initialize 2FA setup.");
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmSetup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const payload = await apiPost<ConfirmResponse>("/auth/2fa/confirm", {
        code: setupCode,
      });

      setTwoFactorEnabled(true);
      setRecoveryCodes(payload.recovery_codes);
      setSetupPayload(null);
      setSetupCode("");
      setMessage(payload.message);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to confirm 2FA setup.");
      }
    } finally {
      setBusy(false);
    }
  };

  const regenerateRecoveryCodes = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      const payload = await apiPost<RegenerateResponse>("/auth/2fa/recovery-codes/regenerate");
      setRecoveryCodes(payload.recovery_codes);
      setMessage("Recovery codes regenerated.");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to regenerate recovery codes.");
      }
    } finally {
      setBusy(false);
    }
  };

  const disableTwoFactor = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    try {
      await apiDelete<{ message: string }>("/auth/2fa");
      setTwoFactorEnabled(false);
      setSetupPayload(null);
      setSetupCode("");
      setRecoveryCodes([]);
      setMessage("Two-factor authentication disabled.");
      await loadState();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to disable two-factor authentication.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <EmsShell title="Settings">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:col-span-2">
          <h2 className="font-semibold">Security & 2FA</h2>
          <p className="mt-2 text-sm text-slate-500">
            Status: {loadingState ? "loading..." : twoFactorEnabled ? "Enabled" : "Disabled"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {!twoFactorEnabled && (
              <button
                onClick={beginSetup}
                disabled={busy || loadingState}
                className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60"
              >
                Enable 2FA
              </button>
            )}
            {twoFactorEnabled && (
              <>
                <button
                  onClick={regenerateRecoveryCodes}
                  disabled={busy || loadingState}
                  className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60"
                >
                  Regenerate recovery codes
                </button>
                <button
                  onClick={disableTwoFactor}
                  disabled={busy || loadingState}
                  className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60"
                >
                  Disable 2FA
                </button>
              </>
            )}
          </div>

          {setupPayload && !twoFactorEnabled && (
            <div className="mt-4 rounded border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm text-slate-500">Scan QR code with your authenticator app:</p>
              <Image
                src={setupPayload.qr_url}
                alt="2FA QR"
                width={176}
                height={176}
                className="mt-2 rounded bg-white p-2"
              />
              <p className="mt-2 text-xs text-slate-500">Manual key: {setupPayload.secret}</p>

              <form className="mt-3 flex gap-2" onSubmit={confirmSetup}>
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={setupCode}
                  onChange={(event) => setSetupCode(event.target.value.replace(/\D/g, ""))}
                  className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                  placeholder="6-digit code"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 disabled:opacity-60"
                >
                  Confirm
                </button>
              </form>
            </div>
          )}

          {!!recoveryCodes.length && (
            <div className="mt-4 rounded border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="text-sm font-semibold">Recovery codes</h3>
              <p className="mt-1 text-xs text-slate-500">Store these safely. They may be shown only once.</p>
              <div className="mt-2 grid gap-1 text-sm md:grid-cols-2">
                {recoveryCodes.map((code) => (
                  <div key={code} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">
                    {code}
                  </div>
                ))}
              </div>
            </div>
          )}

          {message && <p className="mt-3 text-sm text-emerald-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {["Appearance", "Activity log preferences", "Database backup", "Preferences", "Documentation visibility"].map((item) => (
          <div key={item} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">{item}</h2>
            <p className="mt-2 text-sm text-slate-500">Module scaffolded for parity implementation.</p>
          </div>
        ))}
      </section>
    </EmsShell>
  );
}
