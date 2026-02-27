"use client";

import { PlantMapPreview } from "@/components/plant-map-preview";
import { EmsShell } from "@/components/ems-shell";
import { apiGet } from "@/lib/api";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartDataset,
  type ChartOptions,
} from "chart.js";
import { Bell, Cpu, Info, MapPin } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type AnyRecord = Record<string, unknown>;

type PlantDataPoint = {
  name?: string;
  unit?: string;
  value?: number;
};

type PlantGraphPoint = {
  dt_iso_utc?: string;
  datapoints?: PlantDataPoint[];
};

type PlantMetadata = {
  capacity?: number;
  last_update_iso_utc?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  uuid?: string;
  display_name?: string;
};

type PlantDevice = {
  uuid?: string;
  device_type?: string;
  device_model?: string;
  device_manufacturer?: string;
  device_status?: string;
};

type PlantMainFeed = {
  uuid?: string;
  devices?: PlantDevice[];
};

type PlantControllerNode = {
  uuid?: string;
  serial_number?: string;
  main_feeds?: PlantMainFeed[];
};

type PlantViewExternal = {
  plant_metadata?: PlantMetadata;
  data_graphs?: PlantGraphPoint[];
  controllers?: PlantControllerNode[];
};

type PlantViewResponse = {
  local?: AnyRecord | null;
  external?: PlantViewExternal | null;
  display_name?: string | null;
};

type PlantEvent = {
  id?: number;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  event_type?: string;
  event_timestamp?: string;
  created_at?: string;
};

type PlantEventsResponse = {
  local?: PlantEvent[];
  external?: unknown;
};

type SessionCacheEntry<T> = {
  timestamp: number;
  payload: T;
};

const PLANT_VIEW_CACHE_TTL_MS = 2 * 60 * 1000;

type ParsedChartData = {
  labels: string[];
  datasets: ChartDataset<"line", number[]>[];
};

type SeriesSpec = {
  sourceName: string;
  label: string;
  color: string;
  axisId?: string;
  convert?: (value: number) => number;
};

const defaultChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: { legend: { position: "top" } },
};

function toRecord(value: unknown): AnyRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as AnyRecord) : null;
}

function normalizeEvents(payload: PlantEventsResponse | null): PlantEvent[] {
  if (!payload) {
    return [];
  }

  const local = Array.isArray(payload.local) ? payload.local : [];
  const external = payload.external;

  let externalEvents: PlantEvent[] = [];
  if (Array.isArray(external)) {
    externalEvents = external as PlantEvent[];
  } else {
    const record = toRecord(external);
    if (record) {
      const direct = Array.isArray(record.events)
        ? record.events
        : Array.isArray(record.data)
          ? record.data
          : Array.isArray(record.items)
            ? record.items
            : [];
      externalEvents = direct as PlantEvent[];
    }
  }

  const combined = [...local, ...externalEvents];
  const unique = new Map<string, PlantEvent>();
  for (const item of combined) {
    const key = `${item.id ?? ""}-${item.event_timestamp ?? item.created_at ?? ""}-${item.title ?? ""}`;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return [...unique.values()].sort((a, b) => {
    const left = new Date(a.event_timestamp ?? a.created_at ?? 0).getTime();
    const right = new Date(b.event_timestamp ?? b.created_at ?? 0).getTime();
    return right - left;
  });
}

function getPlantViewCacheKey(uid: string): string {
  return `ems.plant.view.${uid}`;
}

function getPlantEventsCacheKey(uid: string): string {
  return `ems.plant.events.${uid}`;
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

function writeSessionCache<T>(key: string, payload: T): void {
  if (typeof window === "undefined") {
    return;
  }

  const value: SessionCacheEntry<T> = {
    timestamp: Date.now(),
    payload,
  };

  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function PlantViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 h-4 w-28 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-36 rounded bg-slate-200 dark:bg-slate-700" />
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-3 gap-2">
          <div className="h-9 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-9 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 h-4 w-36 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-[320px] rounded bg-slate-200 dark:bg-slate-700" />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 h-4 w-48 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-[320px] rounded bg-slate-200 dark:bg-slate-700" />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 h-4 w-44 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-[320px] rounded bg-slate-200 dark:bg-slate-700" />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 h-4 w-44 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-[320px] rounded bg-slate-200 dark:bg-slate-700" />
      </section>
    </div>
  );
}

function toNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

function toIsoTimeLabel(value: string | undefined, index: number): string {
  if (!value) {
    return `${index + 1}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function findDatapointValue(point: PlantGraphPoint, name: string): number | null {
  const row = Array.isArray(point.datapoints) ? point.datapoints : [];
  const item = row.find((entry) => entry?.name === name);
  if (!item) {
    return null;
  }

  return toNumber(item.value);
}

function buildChartData(dataGraphs: PlantGraphPoint[], series: SeriesSpec[]): ParsedChartData {
  if (!Array.isArray(dataGraphs) || dataGraphs.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = dataGraphs.map((point, index) => toIsoTimeLabel(point.dt_iso_utc, index));

  const datasets: ChartDataset<"line", number[]>[] = series.map((spec) => ({
    label: spec.label,
    data: dataGraphs.map((point) => {
      const raw = findDatapointValue(point, spec.sourceName);
      if (raw === null) {
        return Number.NaN;
      }

      return spec.convert ? spec.convert(raw) : raw;
    }),
    borderColor: spec.color,
    backgroundColor: spec.color,
    pointRadius: 0,
    borderWidth: 2,
    spanGaps: true,
    yAxisID: spec.axisId,
  }));

  return { labels, datasets };
}

function hasChartData(data: ParsedChartData): boolean {
  if (!data.labels.length || !data.datasets.length) {
    return false;
  }

  return data.datasets.some((dataset) => dataset.data.some((value) => Number.isFinite(value)));
}

function formatCapacity(value: number | undefined): string {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "—";
  }

  return `${value.toLocaleString()} kW`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function ChartCard({ title, data, options }: { title: string; data: ParsedChartData; options?: ChartOptions<"line"> }) {
  const canRender = hasChartData(data);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {canRender ? (
        <div className="h-[320px]">
          <Line data={data as ChartData<"line">} options={options ?? defaultChartOptions} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          No chart data available from plant_view.
        </div>
      )}
    </section>
  );
}

export default function PlantDetailPage() {
  const params = useParams<{ uid: string }>();
  const uid = params.uid;
  const [payload, setPayload] = useState<PlantViewResponse | null>(() =>
    uid ? readSessionCache<PlantViewResponse>(getPlantViewCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) : null,
  );
  const [eventsPayload, setEventsPayload] = useState<PlantEventsResponse | null>(() =>
    uid ? readSessionCache<PlantEventsResponse>(getPlantEventsCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() =>
    uid ? readSessionCache<PlantViewResponse>(getPlantViewCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) === null : true,
  );
  const [eventsLoading, setEventsLoading] = useState(() =>
    uid ? readSessionCache<PlantEventsResponse>(getPlantEventsCacheKey(uid), PLANT_VIEW_CACHE_TTL_MS) === null : true,
  );
  const [activeTab, setActiveTab] = useState<"data" | "alerts" | "controllers">("data");

  useEffect(() => {
    if (!uid) {
      return;
    }

    let active = true;

    apiGet(`/plants/${uid}/view`)
      .then((data) => {
        if (!active) {
          return;
        }

        const typedData = data as PlantViewResponse;
        setPayload(typedData);
        writeSessionCache(getPlantViewCacheKey(uid), typedData);
        setError(null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setPayload(null);
        setError("Could not load plant details");
        setIsLoading(false);
      });

    apiGet(`/plants/${uid}/events`)
      .then((data) => {
        if (!active) {
          return;
        }

        const typedData = data as PlantEventsResponse;
        setEventsPayload(typedData);
        writeSessionCache(getPlantEventsCacheKey(uid), typedData);
        setEventsError(null);
        setEventsLoading(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        setEventsPayload(null);
        setEventsError("Could not load alerts");
        setEventsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [uid]);

  const local = payload?.local;
  const external = payload?.external;
  const metadata = external?.plant_metadata;

  const localRecord = toRecord(local);
  const localDisplayName = localRecord?.display_name;
  const localPlantName = localRecord?.plant_name;
  const responseDisplayName = payload?.display_name;
  const title =
    (typeof responseDisplayName === "string" && responseDisplayName.trim().length > 0 ? responseDisplayName : null) ??
    (typeof localDisplayName === "string" && localDisplayName.trim().length > 0 ? localDisplayName : null) ??
    (typeof localPlantName === "string" && localPlantName.trim().length > 0 ? localPlantName : null) ??
    `Plant ${uid}`;
  const events = normalizeEvents(eventsPayload);
  const controllers = Array.isArray(external?.controllers) ? external.controllers : [];

  const energyLiveChart = useMemo(
    () => {
      const dataGraphs = Array.isArray(external?.data_graphs) ? external.data_graphs : [];
      return buildChartData(dataGraphs, [
        { sourceName: "PV Power", label: "PV (kW)", color: "#2563eb", axisId: "yPower", convert: (value) => value / 1000 },
        { sourceName: "BESS Power", label: "Battery (kW)", color: "#ef4444", axisId: "yPower", convert: (value) => value / 1000 },
        { sourceName: "Grid Power", label: "Grid (kW)", color: "#22c55e", axisId: "yPower", convert: (value) => value / 1000 },
        { sourceName: "Load Power", label: "Load (kW)", color: "#f59e0b", axisId: "yPower", convert: (value) => value / 1000 },
        { sourceName: "BESS State of Charge", label: "Battery SOC (%)", color: "#8b5cf6", axisId: "ySoc" },
      ]);
    },
    [external],
  );

  const batteryPricingChart = useMemo(
    () => {
      const dataGraphs = Array.isArray(external?.data_graphs) ? external.data_graphs : [];
      return buildChartData(dataGraphs, [
        { sourceName: "BESS Power", label: "Battery Power (kW)", color: "#22c55e", axisId: "yPower", convert: (value) => value / 1000 },
        { sourceName: "NordPool Day-ahead Price", label: "Energy Price (Eur/MWh)", color: "#0ea5e9", axisId: "yPrice" },
      ]);
    },
    [external],
  );

  const loadSolarChart = useMemo(
    () => {
      const dataGraphs = Array.isArray(external?.data_graphs) ? external.data_graphs : [];
      return buildChartData(dataGraphs, [
        { sourceName: "Load Power", label: "Load (kW)", color: "#ef4444", convert: (value) => value / 1000 },
        { sourceName: "Forecasted Load Power", label: "Load Prediction (kW)", color: "#22c55e", convert: (value) => value / 1000 },
        { sourceName: "PV Power", label: "Solar Power (kW)", color: "#2563eb", convert: (value) => value / 1000 },
        { sourceName: "Forecasted PV Power", label: "Solar Prediction (kW)", color: "#f59e0b", convert: (value) => value / 1000 },
      ]);
    },
    [external],
  );

  const plannedActiveBatteryChart = useMemo(
    () => {
      const dataGraphs = Array.isArray(external?.data_graphs) ? external.data_graphs : [];
      return buildChartData(dataGraphs, [
        { sourceName: "Planned Active Power", label: "Planned Active Power (kW)", color: "#2563eb", convert: (value) => value / 1000 },
        { sourceName: "BESS Power", label: "Battery Power (kW)", color: "#22c55e", convert: (value) => value / 1000 },
      ]);
    },
    [external],
  );

  const energyLiveOptions: ChartOptions<"line"> = {
    ...defaultChartOptions,
    scales: {
      yPower: { type: "linear", position: "left", title: { display: true, text: "Power (kW)" } },
      ySoc: { type: "linear", position: "right", title: { display: true, text: "SOC (%)" }, grid: { drawOnChartArea: false } },
    },
  };

  const batteryPricingOptions: ChartOptions<"line"> = {
    ...defaultChartOptions,
    scales: {
      yPower: { type: "linear", position: "left", title: { display: true, text: "Power (kW)" } },
      yPrice: { type: "linear", position: "right", title: { display: true, text: "Price (Eur/MWh)" }, grid: { drawOnChartArea: false } },
    },
  };

  return (
    <EmsShell title={title}>
      {isLoading ? (
        <PlantViewSkeleton />
      ) : error ? (
        <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-200">
          {error}
        </section>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <Info size={18} className="opacity-80" aria-hidden />
                <span>General Info</span>
              </h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-sm">
                <dt className="text-slate-500 dark:text-slate-400">Capacity</dt>
                <dd className="justify-self-end font-medium">{formatCapacity(metadata?.capacity)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd className="justify-self-end">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {metadata?.status ?? "Unknown"}
                  </span>
                </dd>
                <dt className="text-slate-500 dark:text-slate-400">Last Update</dt>
                <dd className="justify-self-end font-medium">{formatDateTime(metadata?.last_update_iso_utc)}</dd>
              </dl>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MapPin size={18} className="opacity-80" aria-hidden />
                <span>Map Location</span>
              </h2>
              <PlantMapPreview latitude={metadata?.latitude} longitude={metadata?.longitude} label={title} />
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("data")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === "data"
                    ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Info size={15} className="opacity-80" aria-hidden />
                  Data
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("alerts")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === "alerts"
                    ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Bell size={15} className="opacity-80" aria-hidden />
                  Alerts
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("controllers")}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === "controllers"
                    ? "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Cpu size={15} className="opacity-80" aria-hidden />
                  Controllers and Devices
                </span>
              </button>
            </div>
          </section>

          {activeTab === "data" ? (
            <div className="space-y-4">
              <ChartCard title="Energy Live Chart" data={energyLiveChart} options={energyLiveOptions} />
              <ChartCard title="Batery power and energy pricing chart" data={batteryPricingChart} options={batteryPricingOptions} />
              <ChartCard title="Load and solar prediction" data={loadSolarChart} />
              <ChartCard title="Planned active power and batery" data={plannedActiveBatteryChart} />
            </div>
          ) : null}

          {activeTab === "alerts" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-sm font-semibold">Alerts</h2>
              {eventsLoading ? (
                <p className="text-sm text-slate-500">Loading alerts...</p>
              ) : eventsError ? (
                <p className="text-sm text-rose-600">{eventsError}</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-slate-500">No alerts found.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((event, index) => (
                    <article key={`${event.id ?? "n"}-${index}`} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium">{event.title ?? event.event_type ?? "Alert"}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {event.severity ?? "info"}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">{event.description ?? "No description"}</p>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDateTime(event.event_timestamp ?? event.created_at)} · {event.status ?? "active"}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          {activeTab === "controllers" ? (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-3 text-sm font-semibold">Controllers and Devices</h2>
              {controllers.length === 0 ? (
                <p className="text-sm text-slate-500">No controllers/devices found.</p>
              ) : (
                <div className="space-y-3">
                  {controllers.map((controller, controllerIndex) => {
                    const feeds = Array.isArray(controller.main_feeds) ? controller.main_feeds : [];
                    const devices = feeds.flatMap((feed) => (Array.isArray(feed.devices) ? feed.devices : []));

                    return (
                      <article key={`${controller.uuid ?? "controller"}-${controllerIndex}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                        <div className="mb-2 text-sm font-medium">
                          Controller: {controller.serial_number ?? controller.uuid ?? `#${controllerIndex + 1}`}
                        </div>
                        {devices.length === 0 ? (
                          <p className="text-sm text-slate-500">No devices for this controller.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                              <thead className="text-xs uppercase text-slate-500">
                                <tr>
                                  <th className="px-2 py-2">Type</th>
                                  <th className="px-2 py-2">Model</th>
                                  <th className="px-2 py-2">Manufacturer</th>
                                  <th className="px-2 py-2">Status</th>
                                  <th className="px-2 py-2">UUID</th>
                                </tr>
                              </thead>
                              <tbody>
                                {devices.map((device, deviceIndex) => (
                                  <tr key={`${device.uuid ?? "device"}-${deviceIndex}`} className="border-t border-slate-200 dark:border-slate-800">
                                    <td className="px-2 py-2">{device.device_type ?? "—"}</td>
                                    <td className="px-2 py-2">{device.device_model ?? "—"}</td>
                                    <td className="px-2 py-2">{device.device_manufacturer ?? "—"}</td>
                                    <td className="px-2 py-2">{device.device_status ?? "—"}</td>
                                    <td className="px-2 py-2 font-mono text-xs">{device.uuid ?? "—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
        </div>
      )}
    </EmsShell>
  );
}
