"use client";

import { FormEvent, useEffect, useState } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiDelete, apiGet, apiPost } from "@/lib/api";

type Customer = {
  id: number;
  name: string;
  email?: string | null;
  rekvizitai_url?: string | null;
  last_scraped_at?: string | null;
  is_scraping?: boolean;
};
type Plant = { uid: string; plant_name?: string | null };

type CustomerPlantsPayload = {
  assigned_plant_uids: string[];
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [rekvizitaiUrl, setRekvizitaiUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const [customersPayload, plantsPayload] = await Promise.all([
        apiGet<Customer[]>("/customers"),
        apiGet<{ local: Array<{ uid: string; plant_name?: string | null }> }>("/plants/list"),
      ]);

      setCustomers(customersPayload);
      setPlants(plantsPayload.local);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load customers.");
    }
  };

  const loadAssignments = async (customerId: number) => {
    setSelectedCustomerId(customerId);
    const payload = await apiGet<CustomerPlantsPayload>(`/customers/${customerId}/plants`);
    setAssigned(payload.assigned_plant_uids ?? []);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      apiGet<Customer[]>("/customers"),
      apiGet<{ local: Array<{ uid: string; plant_name?: string | null }> }>("/plants/list"),
    ])
      .then(([customersPayload, plantsPayload]) => {
        if (!active) {
          return;
        }
        setCustomers(customersPayload);
        setPlants(plantsPayload.local);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load customers.");
      });

    return () => {
      active = false;
    };
  }, []);

  const createCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await apiPost("/customers", {
      name,
      rekvizitai_url: rekvizitaiUrl || undefined,
    });
    setName("");
    setRekvizitaiUrl("");
    setMessage("Customer created.");
    await load();
  };

  const scrapeCustomer = async (customerId: number) => {
    setError(null);
    setMessage(null);

    try {
      const response = await apiPost<{ message: string }>(`/customers/${customerId}/scrape-rekvizitai`);
      setMessage(response.message);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to scrape Rekvizitai.");
    }
  };

  return (
    <EmsShell title="Customers">
      <form className="mb-4 flex gap-2" onSubmit={createCustomer}>
        <input className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800" value={name} onChange={(event) => setName(event.target.value)} placeholder="New customer name" required />
        <input
          className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          value={rekvizitaiUrl}
          onChange={(event) => setRekvizitaiUrl(event.target.value)}
          placeholder="Rekvizitai URL (optional)"
          type="url"
        />
        <button className="rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-700" type="submit">Create</button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">Customer list</h2>
          <div className="space-y-2 text-sm">
            {customers.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                <button className="text-left" onClick={() => loadAssignments(item.id)}>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-slate-500">{item.email ?? "-"}</div>
                  <div className="text-xs text-slate-500">{item.rekvizitai_url ?? "No Rekvizitai URL"}</div>
                  {item.last_scraped_at && <div className="text-xs text-slate-500">Last scraped: {new Date(item.last_scraped_at).toLocaleString()}</div>}
                </button>
                <div className="flex gap-2">
                  <button
                    className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 disabled:opacity-60"
                    onClick={() => scrapeCustomer(item.id)}
                    disabled={!item.rekvizitai_url || item.is_scraping}
                  >
                    {item.is_scraping ? "Scraping..." : "Scrape"}
                  </button>
                  <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiDelete(`/customers/${item.id}`).then(load)}>Delete</button>
                </div>
              </div>
            ))}
            {!customers.length && <p className="text-slate-500">No customers.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold">Plant assignments</h2>
          {selectedCustomerId ? (
            <div className="space-y-2 text-sm">
              {plants.map((plant) => {
                const isAssigned = assigned.includes(plant.uid);
                return (
                  <div key={plant.uid} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 dark:border-slate-800">
                    <div>
                      <div className="font-medium">{plant.plant_name ?? plant.uid}</div>
                      <div className="text-slate-500">{plant.uid}</div>
                    </div>
                    {isAssigned ? (
                      <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiDelete(`/customers/${selectedCustomerId}/plants/${plant.uid}`).then(() => loadAssignments(selectedCustomerId))}>Unassign</button>
                    ) : (
                      <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => apiPost(`/customers/${selectedCustomerId}/plants`, { plant_uid: plant.uid }).then(() => loadAssignments(selectedCustomerId))}>Assign</button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">Select a customer to manage assignments.</p>
          )}
        </section>
      </div>

      {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </EmsShell>
  );
}
