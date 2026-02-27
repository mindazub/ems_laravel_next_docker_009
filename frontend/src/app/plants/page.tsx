"use client";

import Link from "next/link";
import Image from "next/image";
import { EmsShell } from "@/components/ems-shell";
import { PlantMapPreview } from "@/components/plant-map-preview";
import { apiGet } from "@/lib/api";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

type Plant = {
  id: number;
  uid: string;
  display_name?: string | null;
  owner: string;
  status: string;
  capacity: number;
  plant_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  last_update_iso_utc?: string | null;
};
type ExternalPlant = {
  uuid: string;
  display_name?: string | null;
  status?: string;
  capacity?: number;
  latitude?: number;
  longitude?: number;
  last_update_iso_utc?: string;
};
type PlantsListResponse = { local?: Plant[]; external?: { plants?: ExternalPlant[] } };
type PlantsCache = { timestamp: number; plants: Plant[] };

const AUTH_STORAGE_KEY = "ems.auth.session";
const PLANTS_CACHE_KEY = "ems.plants.cache.v1";
const PLANTS_CACHE_FRESH_MS = 2 * 60 * 1000;
const PLANTS_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
const PLANT_VIEW_CACHE_TTL_MS = 2 * 60 * 1000;

type SessionCacheEntry<T> = {
  timestamp: number;
  payload: T;
};

function writeSessionCache<T>(key: string, payload: T) {
  if (typeof window === "undefined") {
    return;
  }

  const value: SessionCacheEntry<T> = {
    timestamp: Date.now(),
    payload,
  };

  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function readSessionCache<T>(key: string, ttlMs: number): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SessionCacheEntry<T>;
    if (typeof parsed.timestamp !== "number") {
      return null;
    }

    if (Date.now() - parsed.timestamp > ttlMs) {
      return null;
    }

    return parsed.payload;
  } catch {
    return null;
  }
}

function getPlantViewCacheKey(uid: string): string {
  return `ems.plant.view.${uid}`;
}

function getPlantEventsCacheKey(uid: string): string {
  return `ems.plant.events.${uid}`;
}

function subscribeAuthSession(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onStoreChange();
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener("storage", listener);
  };
}

function getAuthSessionSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
}

function readPlantsCache(): PlantsCache | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PLANTS_CACHE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PlantsCache;
    if (!Array.isArray(parsed.plants) || typeof parsed.timestamp !== "number") {
      return null;
    }

    const age = Date.now() - parsed.timestamp;
    if (age > PLANTS_CACHE_MAX_AGE_MS) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writePlantsCache(plants: Plant[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload: PlantsCache = {
    timestamp: Date.now(),
    plants,
  };

  window.localStorage.setItem(PLANTS_CACHE_KEY, JSON.stringify(payload));
}

function mapPlantsFromResponse(payload: PlantsListResponse): Plant[] {
  const localPlants = payload.local ?? [];
  const localByUid = new Map(localPlants.map((plant) => [plant.uid, plant]));
  const externalPlants = Array.isArray(payload.external?.plants) ? payload.external.plants : [];

  const mergedFromExternal: Plant[] = externalPlants
    .filter((plant) => typeof plant.uuid === "string" && plant.uuid.length > 0)
    .map((externalPlant, index) => {
      const localPlant = localByUid.get(externalPlant.uuid);

      return {
        id: localPlant?.id ?? index + 1,
        uid: externalPlant.uuid,
        display_name: externalPlant.display_name ?? localPlant?.display_name ?? localPlant?.plant_name ?? null,
        owner: localPlant?.owner ?? "External",
        status: externalPlant.status ?? localPlant?.status ?? "Unknown",
        capacity: Number(externalPlant.capacity ?? localPlant?.capacity ?? 0),
        plant_name: localPlant?.plant_name ?? null,
        latitude: externalPlant.latitude,
        longitude: externalPlant.longitude,
        last_update_iso_utc: externalPlant.last_update_iso_utc,
      };
    });

  const knownUids = new Set(mergedFromExternal.map((plant) => plant.uid));
  const localOnlyPlants = localPlants
    .filter((plant) => !knownUids.has(plant.uid))
    .map((plant) => ({
      ...plant,
      display_name: plant.display_name ?? plant.plant_name ?? null,
      latitude: plant.latitude ?? null,
      longitude: plant.longitude ?? null,
      last_update_iso_utc: plant.last_update_iso_utc ?? null,
    }));

  return [...mergedFromExternal, ...localOnlyPlants];
}

function formatCapacity(capacity: number) {
  if (!Number.isFinite(capacity) || capacity <= 0) {
    return "—";
  }

  if (capacity >= 1000000) {
    return `${(capacity / 1000000).toFixed(2)} MWh`;
  }

  if (capacity >= 1000) {
    return `${(capacity / 1000).toFixed(0)} kWh`;
  }

  return `${capacity.toFixed(0)} Wh`;
}

function formatLastUpdate(value?: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function PlantsListSkeleton() {
  const placeholders = Array.from({ length: 6 }, (_, index) => index);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 animate-pulse">
      <div className="mb-4 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="h-10 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-36 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-36 rounded-md bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-28 rounded-md bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="mb-4 h-4 w-64 rounded bg-slate-200 dark:bg-slate-700" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {placeholders.map((index) => (
          <article key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="h-36 w-full bg-slate-200 dark:bg-slate-700" />
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-1 h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-1 h-4 w-44 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-3 h-9 w-full rounded-md bg-slate-200 dark:bg-slate-700" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOwner, setSelectedOwner] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [prefetchingUids, setPrefetchingUids] = useState<Record<string, true>>({});
  const authSessionRaw = useSyncExternalStore(
    subscribeAuthSession,
    getAuthSessionSnapshot,
    () => "",
  );
  const userRole = useMemo(() => {
    if (!authSessionRaw) {
      return "customer";
    }

    try {
      const parsed = JSON.parse(authSessionRaw) as { user?: { role?: "admin" | "staff" | "manager" | "installer" | "customer" } };
      return parsed.user?.role ?? "customer";
    } catch {
      return "customer";
    }
  }, [authSessionRaw]);

  const ownerOptions = useMemo(() => {
    const owners = Array.from(new Set(plants.map((plant) => plant.owner).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return ["all", ...owners];
  }, [plants]);

  const statusOptions = useMemo(() => {
    const statuses = Array.from(new Set(plants.map((plant) => plant.status).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    return ["all", ...statuses];
  }, [plants]);

  const filteredPlants = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return plants.filter((plant) => {
      const matchesSearch =
        !normalizedSearch ||
        plant.uid.toLowerCase().includes(normalizedSearch) ||
        (plant.display_name ?? "").toLowerCase().includes(normalizedSearch);

      const matchesOwner = selectedOwner === "all" || plant.owner === selectedOwner;
      const matchesStatus = selectedStatus === "all" || plant.status === selectedStatus;

      return matchesSearch && matchesOwner && matchesStatus;
    });
  }, [plants, search, selectedOwner, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredPlants.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const pagedPlants = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredPlants.slice(start, start + pageSize);
  }, [filteredPlants, effectivePage, pageSize]);

  useEffect(() => {
    let active = true;

    const fetchPlants = async (force = false) => {
      const cached = readPlantsCache();
      const isFresh = cached ? Date.now() - cached.timestamp <= PLANTS_CACHE_FRESH_MS : false;

      if (!force && isFresh) {
        if (active) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const payload = await apiGet<PlantsListResponse>("/plants/list");
        const mappedPlants = mapPlantsFromResponse(payload);

        if (active) {
          setPlants(mappedPlants);
          setIsLoading(false);
        }

        writePlantsCache(mappedPlants);
      } catch {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    const initialize = async () => {
      const cached = readPlantsCache();
      if (cached && active) {
        setPlants(cached.plants);
        setIsLoading(false);
      }

      await fetchPlants(false);
    };

    const revalidateOnVisibility = () => {
      if (document.visibilityState === "visible") {
        void fetchPlants(false);
      }
    };

    const revalidateOnReconnect = () => {
      void fetchPlants(false);
    };

    void initialize();
    window.addEventListener("visibilitychange", revalidateOnVisibility);
    window.addEventListener("online", revalidateOnReconnect);

    return () => {
      active = false;
      window.removeEventListener("visibilitychange", revalidateOnVisibility);
      window.removeEventListener("online", revalidateOnReconnect);
    };
  }, []);

  const prefetchPlantOverview = async (uid: string) => {
    if (!uid || prefetchingUids[uid]) {
      return;
    }

    const hasFreshView = readSessionCache<unknown>(getPlantViewCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) !== null;
    const hasFreshEvents = readSessionCache<unknown>(getPlantEventsCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) !== null;

    if (hasFreshView && hasFreshEvents) {
      return;
    }

    setPrefetchingUids((prev) => ({ ...prev, [uid]: true }));

    try {
      const [viewPayload, eventsPayload] = await Promise.all([
        apiGet(`/plants/${uid}/view`),
        apiGet(`/plants/${uid}/events`),
      ]);

      writeSessionCache(getPlantViewCacheKey(uid), viewPayload);
      writeSessionCache(getPlantEventsCacheKey(uid), eventsPayload);
    } catch {
    } finally {
      setPrefetchingUids((prev) => {
        const clone = { ...prev };
        delete clone[uid];
        return clone;
      });
    }
  };

  return (
    <EmsShell title={userRole === "customer" ? "My Plants" : "Plants"}>
      {isLoading ? (
        <PlantsListSkeleton />
      ) : !plants.length ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">No plants available</h2>
          <p className="mt-2 text-sm text-slate-500">No plant data was returned from the API.</p>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search plants..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950"
              />
              <select
                value={selectedOwner}
                onChange={(event) => {
                  setSelectedOwner(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>
                    {owner === "all" ? "All customers" : owner}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(event) => {
                  setSelectedStatus(event.target.value);
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === "all" ? "All status" : status}
                  </option>
                ))}
              </select>
              <select
                value={String(pageSize)}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="6">6 per page</option>
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
              </select>
            </div>
          </div>
          <div className="mb-4 text-sm text-slate-500">Showing {pagedPlants.length ? (effectivePage - 1) * pageSize + 1 : 0}-{Math.min(effectivePage * pageSize, filteredPlants.length)} of {filteredPlants.length} plants</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pagedPlants.map((plant) => {
              const plantLabel = plant.display_name ?? `Plant ${plant.uid.slice(0, 8)}`;

              return (
                <article key={plant.uid} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <PlantMapPreview latitude={plant.latitude} longitude={plant.longitude} label={plantLabel} />
                  <div className="p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 truncate font-semibold">
                        <Image src="/brand/icons/plants.png" alt="" width={20} height={20} className="h-5 w-5 shrink-0 opacity-80" aria-hidden />
                        <span className="truncate">{plantLabel}</span>
                      </h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        {plant.status || "Unknown"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Capacity: {formatCapacity(plant.capacity)}</p>
                    <p className="mt-1 text-xs text-slate-500">Last updated: {formatLastUpdate(plant.last_update_iso_utc)}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">UID: {plant.uid}</p>
                    <Link
                      href={`/plants/${plant.uid}`}
                      prefetch={true}
                      onMouseEnter={() => {
                        void prefetchPlantOverview(plant.uid);
                      }}
                      onFocus={() => {
                        void prefetchPlantOverview(plant.uid);
                      }}
                      className="mt-3 block rounded-md bg-slate-900 px-3 py-2 text-center text-xs font-medium text-white dark:bg-slate-200 dark:text-slate-900"
                    >
                      Plant Overview
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          {filteredPlants.length > pageSize ? (
            <div className="mt-5 flex items-center justify-center gap-2 text-sm">
              <button
                onClick={() => setCurrentPage((page) => Math.max(1, Math.min(page, totalPages) - 1))}
                disabled={effectivePage === 1}
                className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
              >
                Previous
              </button>
              <span className="rounded bg-slate-900 px-3 py-1 text-white dark:bg-slate-200 dark:text-slate-900">
                {effectivePage}
              </span>
              <button
                onClick={() => setCurrentPage((page) => Math.min(totalPages, Math.min(page, totalPages) + 1))}
                disabled={effectivePage === totalPages}
                className="rounded border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          ) : null}
        </section>
      )}
    </EmsShell>
  );
}
