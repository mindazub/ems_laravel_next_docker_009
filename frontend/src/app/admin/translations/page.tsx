"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type Translation = { id: number; key: string; locale: string; value: string };

export default function TranslationsPage() {
  const [items, setItems] = useState<Translation[]>([]);
  const [form, setForm] = useState({ key: "", locale: "en", value: "" });
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const payload = await apiGet<Translation[]>("/translations");
      setItems(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load translations.");
    }
  };

  useEffect(() => {
    let active = true;
    apiGet<Translation[]>("/translations")
      .then((payload) => {
        if (!active) {
          return;
        }
        setItems(payload);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load translations.");
      });

    return () => {
      active = false;
    };
  }, []);

  const createItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await apiPost("/translations", form);
    setForm({ key: "", locale: "en", value: "" });
    await load();
  };

  return (
    <EmsShell title="Translations">
      <form className="mb-4 grid gap-2 md:grid-cols-4" onSubmit={createItem}>
        <input className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.key} onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))} placeholder="key" required />
        <input className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.locale} onChange={(event) => setForm((prev) => ({ ...prev, locale: event.target.value }))} placeholder="locale" required />
        <input className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 md:col-span-2" value={form.value} onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))} placeholder="value" required />
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 md:col-span-4" type="submit">Create translation</button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2 text-sm">
          {items.slice(0, 200).map((item) => (
            <div key={item.id} className="rounded border border-slate-200 p-2 dark:border-slate-800">
              <div className="font-medium">{item.key} ({item.locale})</div>
              <textarea className="mt-2 w-full rounded border border-slate-300 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800" defaultValue={item.value} onBlur={(event) => apiPut(`/translations/${item.id}`, { value: event.target.value })} />
              <button className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiDelete(`/translations/${item.id}`).then(load)}>Delete</button>
            </div>
          ))}
          {!items.length && <p className="text-slate-500">No translations.</p>}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
    </EmsShell>
  );
}
