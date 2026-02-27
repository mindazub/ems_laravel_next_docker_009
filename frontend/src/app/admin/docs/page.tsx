"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiDelete, apiGet, apiPost } from "@/lib/api";

type Documentation = { id: number; title: string; category: string; visibility: string; is_published: boolean };

export default function DocsAdminPage() {
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [form, setForm] = useState({ title: "", category: "general", visibility: "staff", content: "", is_published: true });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = await apiGet<Documentation[]>("/documentations");
      setDocs(payload);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load docs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    apiGet<Documentation[]>("/documentations")
      .then((payload) => {
        if (!active) {
          return;
        }
        setDocs(payload);
        setError(null);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load docs.");
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const createDoc = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await apiPost("/documentations", form);
    setForm({ title: "", category: "general", visibility: "staff", content: "", is_published: true });
    await load();
  };

  return (
    <EmsShell title="Documentation Admin">
      <form className="mb-4 space-y-2" onSubmit={createDoc}>
        <input className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" required />
        <div className="grid gap-2 md:grid-cols-2">
          <input className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Category" required />
          <select className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.visibility} onChange={(event) => setForm((prev) => ({ ...prev, visibility: event.target.value }))}>
            <option value="public">public</option>
            <option value="customer">customer</option>
            <option value="staff">staff</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <textarea className="h-36 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={form.content} onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))} placeholder="Content" required />
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" type="submit">Create documentation</button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
            <div className="h-14 rounded border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800" />
          </div>
        ) : (
        <div className="space-y-2 text-sm">
          {docs.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-slate-500">{item.category} · {item.visibility}</div>
              </div>
              <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiDelete(`/documentations/${item.id}`).then(load)}>Delete</button>
            </div>
          ))}
          {!docs.length && <p className="text-slate-500">No docs.</p>}
        </div>
        )}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>
    </EmsShell>
  );
}
