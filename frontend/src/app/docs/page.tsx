"use client";

import { useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet } from "@/lib/api";

type Documentation = { id: number; title: string; category: string; content: string; visibility: string; is_published: boolean };

export default function DocsPage() {
  const [docs, setDocs] = useState<Documentation[]>([]);
  const [selected, setSelected] = useState<Documentation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Documentation[]>("/documentations")
      .then((payload) => {
        const published = payload.filter((item) => item.is_published);
        setDocs(published);
        setSelected(published[0] ?? null);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load docs."));
  }, []);

  return (
    <EmsShell title="Documentation">
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-1 text-sm">
            {docs.map((item) => (
              <button key={item.id} className="block w-full rounded px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSelected(item)}>
                {item.title}
              </button>
            ))}
            {!docs.length && <p className="text-slate-500">No documentation available.</p>}
          </div>
        </aside>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {selected ? (
            <>
              <h2 className="text-xl font-semibold">{selected.title}</h2>
              <p className="mt-1 text-xs text-slate-500">{selected.category} · {selected.visibility}</p>
              <article className="prose prose-sm mt-4 max-w-none dark:prose-invert whitespace-pre-wrap">{selected.content}</article>
            </>
          ) : (
            <p className="text-slate-500">Select a document.</p>
          )}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </section>
      </div>
    </EmsShell>
  );
}
