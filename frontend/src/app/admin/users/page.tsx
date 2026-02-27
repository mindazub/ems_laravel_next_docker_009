"use client";

import { useMemo, useState, useEffect } from "react";
import { EmsShell } from "@/components/ems-shell";
import { ApiError, apiGet, apiPut } from "@/lib/api";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "staff" | "manager" | "installer" | "customer";
  status: string | null;
  is_suspended: boolean;
  customer_id: number | null;
  email_verified_at: string | null;
  created_at: string | null;
};

type UserUpdatePayload = {
  role?: UserRow["role"];
  status?: string;
  is_suspended?: boolean;
};

const ROLES: UserRow["role"][] = ["admin", "staff", "manager", "installer", "customer"];

export default function UsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pending, setPending] = useState<Record<number, UserUpdatePayload>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<UserRow[]>("/admin/users")
      .then((payload) => {
        if (!active) {
          return;
        }
        setUsers(payload);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }
        setError(err instanceof ApiError ? err.message : "Failed to load users.");
      });

    return () => {
      active = false;
    };
  }, []);

  const totalSuspended = useMemo(() => users.filter((user) => user.is_suspended).length, [users]);

  const updateDraft = (userId: number, patch: UserUpdatePayload) => {
    setPending((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        ...patch,
      },
    }));
  };

  const saveUser = async (user: UserRow) => {
    const draft = pending[user.id];
    if (!draft || Object.keys(draft).length === 0) {
      return;
    }

    setSavingId(user.id);
    setError(null);
    setMessage(null);

    try {
      const response = await apiPut<{ user: UserRow; message: string }>(`/admin/users/${user.id}`, draft);
      setUsers((prev) => prev.map((item) => (item.id === user.id ? response.user : item)));
      setPending((prev) => {
        const clone = { ...prev };
        delete clone[user.id];
        return clone;
      });
      setMessage(`Updated ${response.user.email}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update user.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <EmsShell title="Users & Roles">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs uppercase text-slate-500">Users</div>
          <div className="text-2xl font-semibold">{users.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs uppercase text-slate-500">Suspended</div>
          <div className="text-2xl font-semibold">{totalSuspended}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs uppercase text-slate-500">Roles</div>
          <div className="text-sm text-slate-600 dark:text-slate-300">admin/staff/manager/installer/customer</div>
        </div>
      </section>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {message && <p className="mb-3 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-2 py-2">User</th>
                <th className="px-2 py-2">Role</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Suspended</th>
                <th className="px-2 py-2">Verified</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const draft = pending[user.id] ?? {};
                return (
                  <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-2 py-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </td>
                    <td className="px-2 py-2">
                      <select
                        value={draft.role ?? user.role}
                        onChange={(event) => updateDraft(user.id, { role: event.target.value as UserRow["role"] })}
                        className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-2">
                      <input
                        value={draft.status ?? user.status ?? ""}
                        onChange={(event) => updateDraft(user.id, { status: event.target.value })}
                        className="rounded border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={draft.is_suspended ?? user.is_suspended}
                          onChange={(event) => updateDraft(user.id, { is_suspended: event.target.checked })}
                        />
                        <span>{(draft.is_suspended ?? user.is_suspended) ? "Yes" : "No"}</span>
                      </label>
                    </td>
                    <td className="px-2 py-2">{user.email_verified_at ? "Verified" : "Pending"}</td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => saveUser(user)}
                        disabled={savingId === user.id || !pending[user.id]}
                        className="rounded border border-slate-300 px-3 py-1 disabled:opacity-60 dark:border-slate-700"
                      >
                        {savingId === user.id ? "Saving..." : "Save"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </EmsShell>
  );
}
