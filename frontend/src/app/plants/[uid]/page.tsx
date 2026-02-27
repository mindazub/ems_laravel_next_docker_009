"use client";

import { EmsShell } from "@/components/ems-shell";
import { apiGet } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PlantDetailPage() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;
  const [payload, setPayload] = useState<unknown>(null);

  useEffect(() => {
    if (!uid) {
      return;
    }

    let active = true;
    apiGet(`/plants/${uid}/show`)
      .then((data) => {
        if (active) {
          setPayload(data);
        }
      })
      .catch(() => {
        if (active) {
          setPayload({ error: "Could not load plant details" });
        }
      });

    return () => {
      active = false;
    };
  }, [uid]);

  return (
    <EmsShell title={`Plant ${uid}`}>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-3 text-sm font-semibold">Plant detail payload</h2>
        <pre className="overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-50">{JSON.stringify(payload, null, 2)}</pre>
      </section>
    </EmsShell>
  );
}
